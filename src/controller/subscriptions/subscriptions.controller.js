import ModuleBase from "../moduleBase.controller"
import { SubscriptionSchema } from "../../model/subscriptions/Subscriptions.model"
import { UserSchema } from "../../model/users/Users.model"

const LookupHash = {
  users: {
    name: "users",
    schema: UserSchema,
  },
}

class Subscriptions extends ModuleBase {
  constructor() {
    super(SubscriptionSchema, "Subscriptions", LookupHash)
  }
}

export default Subscriptions
