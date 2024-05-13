import { ChatMessageRoleEnum, WorkingMemory, createCognitiveStep, indentNicely, useActions, useBlueprintStore, z, useSoulMemory } from "@opensouls/engine"
import brainstorm from "../cognitiveSteps/brainstorm.js"

const withRagContext = async (workingMemory: WorkingMemory) => {
  const name = workingMemory.soulName
  const { log } = useActions()
  const { search } = useBlueprintStore("default")
  const loadedRAG = useSoulMemory<string>("loadedRAG", "Empty knowledgebase");
  const newUserAction = useSoulMemory<string>("newUserAction", "...");

  //Creating a sub-agent that answers RAG questions
  let ragMemoryAgent = new WorkingMemory({
    soulName: "Chadbot",
    memories: [
      workingMemory.memories[0],
      workingMemory.memories[2] // Using user's new action memory to help answer the question
    ]
  })

  const [, questions] = await brainstorm(
    ragMemoryAgent,
    indentNicely`
      Given the user's question, brainstorm 3 relevant queries to search the knowledgebase.
      Have one of the brainstorms be the user's question directly
  
      Consider the key topics and concepts mentioned in the question, and generate queries to best find similar information from the vector search.
  
      For example:
      - If the user asks "What are Runes?", ${name} might brainstorm:
        1. "Runes"
        1. "What are Runes?"
        2. "How buy Runes?"
  
      - If the user asks "How do I get started with Ordinals?", ${name} might brainstorm:
        1. "Ordinals"
        1. "How do I get started with Ordinals?"
        2. "What is the Ordinal's Quickstart Guide?"

      - The user may sometimes ask about key terms in ordinals, ex. about recursion, reinscription, parent-child and other terms
        1. "Recursion"
        2. "What is recursion?"
  
      Based on the user's question, brainstorm three relevant queries that will help ${name} find relevant information.
    `,
  );

  questions.unshift(newUserAction.current);
  questions.pop();
  log("Brainstormed results", questions)

  const questionAnswers = await Promise.all(questions.map(async (question) => {
    log("search for ", question)
    const vectorResults = await search(question, { minSimilarity: 0.6 })
    log("found", vectorResults.length, "entries")
  
    if (vectorResults.length === 0) {
      return {
        question,
        answer: `${name} doesn't know the answer.`
      }
    }
  
    const memoriesToUseForAnswers: string[] = []
  
    if (vectorResults.length > 0) {
      const topResults = vectorResults
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3);

      topResults.forEach(result => {
        memoriesToUseForAnswers.push(result.content?.toString() || "");
      });
    }
  
    vectorResults.slice(0, 3).forEach((result, index) => {
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
        # Ordinals Knowledge Base 
        IMPORTANT!!! : THE USER CANNOT SEE THIS INFORMATION. USE THIS TO ANSWER THEIR QUESTION
        IMPORTANT!!! : IF THERE ARE LINKS ASSOCIATED WITH THE ANSWER, ADD ALL LINKS
        
        ${cleanedQuestionAnswers.map(({ question, answer }) => indentNicely`
          ## VECTOR DB QUERY: "${question}"
          ${answer}
        `).join("\n\n")}
      `
  }

  loadedRAG.current = newMemory.content
  workingMemory.memories[1].content = newMemory.content

  return workingMemory
}

export default withRagContext