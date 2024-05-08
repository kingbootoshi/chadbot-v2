
import { MentalProcess, useActions } from "@opensouls/engine";
import withRagContext from "../cognitiveFunctions/withRagContext.js";

const updatesFromBlueprintStore: MentalProcess = async ({ workingMemory }) => {
  const { log } = useActions()

  return workingMemory
  // return withRagContext(workingMemory)
}

export default updatesFromBlueprintStore