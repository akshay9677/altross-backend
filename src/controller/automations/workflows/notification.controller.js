import { OTHER_MODULES } from "../../../utils/moduleSchemas"
import ModuleBase from "../../module-base/moduleBase.controller"

class Notifications extends ModuleBase {
  constructor() {
    super({
      model: OTHER_MODULES["notifications"].schema,
      modelName: OTHER_MODULES["notifications"].name,
      moduleName: OTHER_MODULES["notifications"].name,
    })
  }
}

export default Notifications
