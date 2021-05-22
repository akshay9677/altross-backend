import ModuleBase from "./moduleBase.controller"
import { MODULES } from "../utils/moduleSchemas"

const LookupHash = {
  projects: { ...MODULES.projects },
  users: { ...MODULES.users, preFill: true },
}

class Org extends ModuleBase {
  constructor() {
    super(
      MODULES["orgs"].schema,
      MODULES["orgs"].name,
      LookupHash,
      MODULES["orgs"].name
    )
  }
}

export default Org
