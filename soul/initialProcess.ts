
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
  const shortTermChatLogs = useSoulMemory<string[]>("shortTermChatLogs", []);
  const shortTermHistoryString = shortTermChatLogs.current.map((item, index) => `${index + 1}. ${item}`).join("\n\n");
  lastProcess.current = "core";

  // SETTING UP WORKING MEMORY TEMPLATE FOR EASY MANIPULATION

  //RAG Memory
  let ragMemory = {
    role: ChatMessageRoleEnum.Assistant, 
    content: `${loadedRAG.current}`,
  };

  //Short Term Chat Memory
  let shortTermMemory = {
    role: ChatMessageRoleEnum.Assistant, 
    content: `## SHORT TERM CHAT LOGS\n\n${shortTermHistoryString}`,
  };

  // User's New Action Memory
  let usersNewActionMemory = {
    role: ChatMessageRoleEnum.Assistant, 
    content: `## USER'S NEW ACTION\n${newUserAction.current}`,
  };

  //THE CORE, MASTER TEMPLATE OF CHADBOT'S WORKING MEMORY
  let masterMemory = new WorkingMemory({
    soulName: "Chadbot",
    memories: [
      workingMemory.memories[0], //[0] IS THE BASE PROMPT FROM CHADBOT.MD
      ragMemory, // [1] IS CHADBOT'S KNOWLEDGE BASE
      shortTermMemory, //[2] IS THE SHORT TERM CHAT LOGS
      usersNewActionMemory //[3] IS THE USERS'S NEW ACTION
    ]
  });

  masterMemory = await withRagContext(masterMemory)

  const [withDialog, dialog] = await externalDialog(
    masterMemory,
    "Interact with the user",
    { model: "fast" }
  );
  speak(dialog);

  //PUSH CONVO TO SHORT TERM HISTORY
  //Pushing the player's current action & GM's narrative to the short term memory
  shortTermChatLogs.current.push(`//USER INTERACTION\n${newUserAction.current}\n\n//CHADBOT REPLIED:\n${dialog}`);

  return masterMemory;
}

export default core
