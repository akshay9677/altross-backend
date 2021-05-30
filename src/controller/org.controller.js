import ModuleBase from "./module-base/moduleBase.controller"
import { MODULES } from "../utils/moduleSchemas"

const LookupHash = {
  projects: { ...MODULES.projects },
  users: { ...MODULES.users, preFill: true },
}

class Org extends ModuleBase {
  constructor() {
    super({
      model: MODULES["orgs"].schema,
      modelName: MODULES["orgs"].name,
      lookupHash: LookupHash,
      moduleName: MODULES["orgs"].name,
    })
  }
}

export default Org
