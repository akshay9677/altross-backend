import ModuleBase from "../moduleBase.controller"
import { MODULES } from "../../utils/moduleSchemas"

const LookupHash = {
  users: { ...MODULES.users },
}

class Subscriptions extends ModuleBase {
  constructor() {
    super(
      MODULES["subscriptions"].schema,
      MODULES["subscriptions"].name,
      LookupHash,
      MODULES["subscriptions"].name
    )
  }
}

export default Subscriptions
