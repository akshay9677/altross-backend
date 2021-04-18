import ModuleBase from "../moduleBase.controller"
import { UserSchema } from "../../model/users/Users.model"
import { SubscriptionSchema } from "../../model/subscriptions/Subscriptions.model"

const LookupHash = {
  subscriptions: {
    name: "subscriptions",
    schema: SubscriptionSchema,
  },
}

class Users extends ModuleBase {
  constructor() {
    super(UserSchema, "Users", LookupHash)
  }
}

export default Users
