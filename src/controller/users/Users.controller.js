import ModuleBase from "../moduleBase.controller"
import { MODULES } from "../../utils/moduleSchemas"

const LookupHash = {
  subscriptions: { ...MODULES["subscriptions"] },
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
