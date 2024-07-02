import { createCognitiveStep, WorkingMemory, ChatMessageRoleEnum, indentNicely, stripEntityAndVerb, stripEntityAndVerbFromStream } from "@opensouls/engine";

const externalDialog = createCognitiveStep((instructions: string | { instructions: string; verb: string }) => {
  let instructionString: string, verb: string;
  if (typeof instructions === "string") {
    instructionString = instructions;
    verb = "said";
  } else {
    instructionString = instructions.instructions;
    verb = instructions.verb;
  }
  return {
    command: ({ soulName: name }: WorkingMemory) => {
      return {
        role: ChatMessageRoleEnum.System,
        name: name,
        content: indentNicely`
        # INSTRUCTIONS FOR CHADBOT
        
        *  Provide a concise yet comprehensive answer to the user's question, focusing on the most relevant information. 
        *  If the knowledge base contains step-by-step instructions or important details, include the complete information.
        *  IF there are links, Make sure to include all the associated links from the knowledge base in your response. Format the links as markdown hyperlinks with a brief description of each link.
        *  Do not invent or include external links that are not present in the knowledge base.
        *  Aim for a balance between brevity and necessary detail to best address the user's query.
        
        Please reply with the answer to the question  
          `
      };
    },
    streamProcessor: stripEntityAndVerbFromStream,
    postProcess: async (memory: WorkingMemory, response: string) => {
      const stripped = stripEntityAndVerb(memory.soulName, verb, response);
      const newMemory = {
        role: ChatMessageRoleEnum.Assistant,
        content: `${memory.soulName} ${verb}: "${stripped}"`
      };
      return [newMemory, stripped];
    }
  }
})

export default externalDialog