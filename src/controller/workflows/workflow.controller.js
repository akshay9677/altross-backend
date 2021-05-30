import { WorkflowSchema } from "../../model/workflows/workflow.model"
import ModuleBase from "../module-base/moduleBase.controller"

class Workflows extends ModuleBase {
  constructor() {
    super(WorkflowSchema, "Workflows")
  }
}

export default Workflows
