
import { MentalProcess, useActions, useSoulMemory, WorkingMemory, ChatMessageRoleEnum, useProcessManager, usePerceptions } from "@opensouls/engine";
import externalDialog from "./cognitiveSteps/externalDialog.js";
import withRagContext from "./cognitiveFunctions/withRagContext.js";
import { getMetadataFromPerception, getUserDataFromDiscordEvent } from "./lib/utils/discord.js";

const core: MentalProcess = async ({ workingMemory }) => {
  const { speak, log, dispatch } = useActions();
  const { invokingPerception, pendingPerceptions } = usePerceptions();
  const { userName, discordEvent } = getMetadataFromPerception(invokingPerception);
  const lastProcess = useSoulMemory("lastProcess", "core");
  const newUserAction = useSoulMemory<string>("newUserAction", "...");
  const { invocationCount } = useProcessManager()
  const loadedRAG = useSoulMemory<string>("loadedRAG", "## Ordinals Knowledge Base");

  lastProcess.current = "core";

  if (invocationCount === 0){
    speak("Hey! It seems to be our first time speaking. Ask me any Bitcoin/Ordinals related question and I'll do my best to answer it. Users usually start by asking me 'How do I get started with Ordinals?' My knowledgebase is open sourced and is continuously being added to- you can view & add to it here: https://github.com/kingbootoshi/chadbot-v2")
  }

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
  
  dispatch({
    action: "says",
    content: dialog,
    _metadata: {
      discordEvent,
        
    },
  });

  return masterMemory;
}

export default core
