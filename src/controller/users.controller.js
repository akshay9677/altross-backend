import ModuleBase from "./moduleBase.controller"
import { MODULES } from "../utils/moduleSchemas"

const LookupHash = {
  orgs: { ...MODULES.orgs, preFill: true },
  projects: { ...MODULES.projects },
  features: { ...MODULES.features, preFill: true },
}

class Users extends ModuleBase {
  constructor() {
    super(
      MODULES["users"].schema,
      MODULES["users"].name,
      LookupHash,
      MODULES["users"].name
    )
  }
}

export default Users
