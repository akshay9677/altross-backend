import ModuleBase from "./moduleBase.controller"
import { MODULES } from "../utils/moduleSchemas"

const LookupHash = {
  orgs: { ...MODULES.orgs },
  users: { ...MODULES.users },
}

class Projects extends ModuleBase {
  constructor() {
    super(
      MODULES["projects"].schema,
      MODULES["projects"].name,
      LookupHash,
      MODULES["projects"].name
    )
  }
}

export default Projects
