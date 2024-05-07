
import { MentalProcess, useActions, useSoulMemory, WorkingMemory, ChatMessageRoleEnum, indentNicely } from "@opensouls/engine";
import externalDialog from "./cognitiveSteps/externalDialog.js";
import mentalQuery from "./cognitiveSteps/mentalQuery.js";
import internalMonologue from "./cognitiveSteps/internalMonologue.js";
import withRagContext from "./cognitiveFunctions/withRagContext.js";

const core: MentalProcess = async ({ workingMemory }) => {
  const { speak, log } = useActions();
  const lastProcess = useSoulMemory("lastProcess", "core");
  const newUserAction = useSoulMemory<string>("newUserAction", "...");
  const loadedRAG = useSoulMemory<string>("loadedRAG", "Empty knowledgebase");
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

  //Chadbot thinks about updating his memory
  const [thinksAbtRag, thinksRag] = await internalMonologue(
    masterMemory, 
    indentNicely`
    If the user's new input is a question, THINK if you have sufficient knowledge to confidently answer the user's question.

    If you can answer the question based on your existing knowledge, THINK: "I think I have the necessary information to answer this question without updating my memory because my knowledgebase states..."

    If you don't have enough information to answer the question, THINK: "I think I need to update my memory to answer to the user's question, because my knowledgebase says nothing about..."

    If the user's input is not a question (e.g., a greeting or a statement), then you don't need to update your memory. In this case, THINK: "I think I don't need to update my memory because the user did not ask a question."

    IMPORTANT: EXPLICITLY THINK IN FIRST PERSON TO ANALYZE THE CURRENT SCENARIO. START YOUR SENTENCE BY STATING: "I think... X because..."

    (Back your thoughts with a reason why you thought that.)

    IMPORTANT: ANALYZE YOUR "## Ordinals Knowledge Base-" MEMORY SLOT! IF THE ANSWER TO THE USERS QUESTON IS THERE YOU DO NOT NEED TO UPDATE YOUR MEMORY!
    `, { model: "fast" });

  log("Chadbot thinks if he can answer the current question with 100% accuracy...", thinksRag);

  const [, needsRag] = await mentalQuery(thinksAbtRag, "The user has asked a question that Chadbot can't answer with his current memories.", { model: "fast" })

  log("Chadbot needs to update his memory:", needsRag);

  if (needsRag) {
    log("Chadbot is updating his memory...");
    masterMemory = await withRagContext(masterMemory)
  }

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
