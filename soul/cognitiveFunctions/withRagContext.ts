import { ChatMessageRoleEnum, WorkingMemory, createCognitiveStep, indentNicely, useActions, useBlueprintStore, z, useSoulMemory } from "@opensouls/engine"
import brainstorm from "../cognitiveSteps/brainstorm.js"

const MAX_QA_MEMORY_LENGTH = 700

const withRagContext = async (workingMemory: WorkingMemory) => {
  const name = workingMemory.soulName
  const { log } = useActions()
  const { search } = useBlueprintStore("default")
  const loadedRAG = useSoulMemory<string>("loadedRAG", "Empty knowledgebase");

  const [, questions] = await brainstorm(
    workingMemory,
    indentNicely`
      Given the user's question, brainstorm three relevant sub-questions that would help ${name} provide a comprehensive answer.
  
      Consider the key topics and concepts mentioned in the question, and generate sub-questions that explore those areas in more depth.
  
      For example:
      - If the user asks "What are Runes?", ${name} might brainstorm:
        1. What is the definition of Runes in the context of Ordinals?
        2. How are Runes created and traded on the Bitcoin blockchain?
        3. What are the benefits and use cases of Runes?
  
      - If the user asks "How do I get started with Ordinals?", ${name} might brainstorm:
        1. What are the basic steps to create an Ordinal inscription?
        2. What is the Ordinal's Quickstart Guide?
        3. Are there any beginner-friendly guides or resources available?
  
      Based on the user's question, brainstorm three relevant sub-questions that will help ${name} provide a thorough and helpful response.
    `,
  );

  log("Brainstormed results", questions)

  const blankAnsweringMemory = workingMemory.slice(0, 1)

  const questionAnswers = await Promise.all(questions.map(async (question) => {
    log("search for ", question)
    const vectorResults = await search(question, { minSimilarity: 0.6 })
    log("found", vectorResults.length, "entries, similarity:", vectorResults.map((r) => r.similarity))

    if (vectorResults.length === 0) {
      return {
        question,
        answer: `${name} doesn't know the answer.`
      }
    }

    const memoriesToUseForAnswers: string[] = []

    for (const vectorResult of vectorResults) {
      memoriesToUseForAnswers.push(vectorResult.content?.toString() || "")
      if (memoriesToUseForAnswers.join("\n").split(/\s/).length > MAX_QA_MEMORY_LENGTH) {
        break
      }
    }

    const [, answer] = await instruction(
      blankAnsweringMemory,
      indentNicely`
        ${name} remembers these things, related to the question: ${question}.
      
        ${memoriesToUseForAnswers.map((memory) => indentNicely`
          <Memory>
            ${memory}
          </Memory>
        `).join("\n")}

        ${name} considers their <Memory> and answers the question: ${question}
    `
    )

    return {
      question,
      answer,
    }
  }))

  const firstLine = `## Ordinals Knowledge Base`

  let newMemory = {
    role: ChatMessageRoleEnum.Assistant,
    content: indentNicely`
        ${firstLine}
        
        ${questionAnswers.map(({ question, answer }) => indentNicely`
          ### ${question}
          ${answer}
        `).join("\n\n")}
      `
  }

  loadedRAG.current = newMemory.content
  workingMemory.memories[1].content = newMemory.content

  return workingMemory
}

const instruction = createCognitiveStep((instructions: string) => {
  return {
    command: ({ soulName }: WorkingMemory) => {
      return {
        role: ChatMessageRoleEnum.System,
        name: soulName,
        content: instructions,
      };
    }
  };
});

export default withRagContext
