import { PerceptionProcessor, useActions, useSoulMemory } from "@opensouls/engine"
 
const perceptionProcessor: PerceptionProcessor = async ({ perception, workingMemory, currentProcess }) => {
  const { log } = useActions()
  const userName = useSoulMemory("userName", "User") //Replace with your own name
  const newUserAction = useSoulMemory<string>("newUserAction", "...");
  const name = userName.current ? userName.current : perception.name
 
  if (perception.action === "said"){
  let content = `${perception.content}`

  newUserAction.current = content

  log("Perception received!", perception)
  } 
 
  return [workingMemory, currentProcess]
}
 
export default perceptionProcessor