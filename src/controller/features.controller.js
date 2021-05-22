import ModuleBase from "./moduleBase.controller"
import { MODULES } from "../utils/moduleSchemas"

const LookupHash = {
  projects: { ...MODULES.projects },
  users: { ...MODULES.users, preFill: true },
}

class Features extends ModuleBase {
  constructor() {
    super(
      MODULES["features"].schema,
      MODULES["features"].name,
      LookupHash,
      MODULES["features"].name
    )
  }
}

export default Features
