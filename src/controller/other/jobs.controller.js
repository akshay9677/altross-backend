import { OTHER_MODULES } from "../../utils/moduleSchemas"
import ModuleBase from "../module-base/moduleBase.controller"

class Workflows extends ModuleBase {
  constructor() {
    super({
      model: OTHER_MODULES["jobs"].schema,
      modelName: OTHER_MODULES["jobs"].name,
      moduleName: OTHER_MODULES["jobs"].name,
      hideWorkflow: true,
    })
  }
}

export default Workflows
