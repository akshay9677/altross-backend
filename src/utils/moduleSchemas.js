import { SubscriptionSchema } from "../model/subscriptions/Subscriptions.model"
import { UserSchema } from "../model/users/Users.model"

export const MODULES = {
  subscriptions: {
    name: "subscriptions",
    schema: SubscriptionSchema,
  },
  users: {
    name: "users",
    schema: UserSchema,
  },
}
