import { WorkflowSchema } from "../../../model/workflows/workflow.model"
import ModuleBase from "../../module-base/moduleBase.controller"

class Workflows extends ModuleBase {
  constructor() {
    super({
      model: WorkflowSchema,
      modelName: "Workflows",
      moduleName: "Workflows",
    })
  }
}

export default Workflows
