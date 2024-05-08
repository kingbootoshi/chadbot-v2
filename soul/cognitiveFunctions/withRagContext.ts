import { ChatMessageRoleEnum, WorkingMemory, createCognitiveStep, indentNicely, useActions, useBlueprintStore, z, useSoulMemory } from "@opensouls/engine"
import brainstorm from "../cognitiveSteps/brainstorm.js"

const MAX_QA_MEMORY_LENGTH = 700

const withRagContext = async (workingMemory: WorkingMemory) => {
  const name = workingMemory.soulName
  const { log } = useActions()
  const { search } = useBlueprintStore("default")
  const loadedRAG = useSoulMemory<string>("loadedRAG", "Empty knowledgebase");

  //Creating a sub-agent that answers RAG questions
  let ragMemoryAgent = new WorkingMemory({
    soulName: "Chadbot",
    memories: [
      workingMemory.memories[0],
      workingMemory.memories[3] // Using user's new action memory to help answer the question
    ]
  })

  const [, questions] = await brainstorm(
    ragMemoryAgent,
    indentNicely`
      Given the user's question, brainstorm 2 relevant sub-questions to ask your knowledgebase in order to answer the question.
      Have one of the questions be the user's question directly
  
      Consider the key topics and concepts mentioned in the question, and generate sub-questions that explore those areas in more depth.
  
      For example:
      - If the user asks "What are Runes?", ${name} might brainstorm:
        1. "What are Runes?"
        2. "How buy Runes?"
  
      - If the user asks "How do I get started with Ordinals?", ${name} might brainstorm:
        1. "How do I get started with Ordinals?"
        2. "What is the Ordinal's Quickstart Guide?"
  
      Based on the user's question, brainstorm three relevant sub-questions that will help ${name} provide a thorough and helpful response.
    `,
  );

  log("Brainstormed results", questions)

  const blankAnsweringMemory = workingMemory.slice(0, 1)

  const questionAnswers = await Promise.all(questions.map(async (question) => {
    log("search for ", question)
    const vectorResults = await search(question, { minSimilarity: 0.7 })
    log("found", vectorResults.length, "entries")
  
    if (vectorResults.length === 0) {
      return {
        question,
        answer: `${name} doesn't know the answer.`
      }
    }
  
    const memoriesToUseForAnswers: string[] = []
  
    if (vectorResults.length > 0) {
      const bestResult = vectorResults.reduce((prev, current) => 
        (prev.similarity > current.similarity) ? prev : current
      );
      memoriesToUseForAnswers.push(bestResult.content?.toString() || "");
    }
  
    vectorResults.forEach((result, index) => {
      log(`Entry ${index + 1}: similarity ${result.similarity}`);
    });
  
    log("Memories used for answers", memoriesToUseForAnswers);
  
    // Use the first entry from memoriesToUseForAnswers as the answer
    const answer = memoriesToUseForAnswers[0] || "";
  
    return {
      question,
      answer,
    }
  }));

  // Find and log duplicate answers
const uniqueAnswers: Record<string, string[]> = {};

questionAnswers.forEach(({ question, answer }) => {
  if (answer in uniqueAnswers) {
    uniqueAnswers[answer].push(question);
  } else {
    uniqueAnswers[answer] = [question];
  }
});

// Log duplicate answers
Object.entries(uniqueAnswers).forEach(([answer, questions]) => {
  if (questions.length > 1) {
    log(`Duplicate answer found for questions: ${questions.join(", ")}`);
    log(`Answer: ${answer}`);
  }
});

// Clean questionAnswers to have only one question and one answer for duplicates
const cleanedQuestionAnswers = Object.entries(uniqueAnswers).map(([answer, questions]) => ({
  question: questions[0],
  answer,
}));
  
  let newMemory = {
    role: ChatMessageRoleEnum.Assistant,
    content: indentNicely`
        ## Ordinals Knowledge Base (KB)

        !! REMEMBER: ADD LINKS FROM THE KB TO YOUR ANSWER
        
        ${cleanedQuestionAnswers.map(({ question, answer }) => indentNicely`
          ### VECTOR DB QUERY: "${question}"
          ${answer}
        `).join("\n\n")}
      `
  }

  loadedRAG.current = newMemory.content
  workingMemory.memories[1].content = newMemory.content

  return workingMemory
}

export default withRagContext