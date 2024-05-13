
import { MentalProcess, useActions, useSoulMemory, WorkingMemory, ChatMessageRoleEnum, indentNicely } from "@opensouls/engine";
import externalDialog from "./cognitiveSteps/externalDialog.js";
import mentalQuery from "./cognitiveSteps/mentalQuery.js";
import internalMonologue from "./cognitiveSteps/internalMonologue.js";
import withRagContext from "./cognitiveFunctions/withRagContext.js";

const core: MentalProcess = async ({ workingMemory }) => {
  const { speak, log } = useActions();
  const lastProcess = useSoulMemory("lastProcess", "core");
  const newUserAction = useSoulMemory<string>("newUserAction", "...");
  const loadedRAG = useSoulMemory<string>("loadedRAG", "## Ordinals Knowledge Base");

  lastProcess.current = "core";

  // SETTING UP WORKING MEMORY TEMPLATE FOR EASY MANIPULATION

  //RAG Memory
  let ragMemory = {
    role: ChatMessageRoleEnum.Assistant, 
    content: `${loadedRAG.current}`,
  };

  // User's New Action Memory
  let usersNewActionMemory = {
    role: ChatMessageRoleEnum.Assistant, 
    content: `# USER'S QUESTION\n${newUserAction.current}`,
  };

  //THE CORE, MASTER TEMPLATE OF CHADBOT'S WORKING MEMORY
  let masterMemory = new WorkingMemory({
    soulName: "Chadbot",
    memories: [
      workingMemory.memories[0], //[0] IS THE BASE PROMPT FROM CHADBOT.MD
      ragMemory, // [1] IS CHADBOT'S KNOWLEDGE BASE
      usersNewActionMemory //[2] IS THE USERS'S NEW ACTION
    ]
  });

  masterMemory = await withRagContext(masterMemory)

  const [withDialog, dialog] = await externalDialog(
    masterMemory,
    "Interact with the user",
    { model: "fast" }
  );
  speak(dialog);

  return masterMemory;
}

export default core
