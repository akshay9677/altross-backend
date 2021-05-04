import { SubscriptionSchema } from "../model/subscriptions/Subscriptions.model"
import { UserSchema } from "../model/users/Users.model"
import { FormSchema } from "../model/forms/forms.model"
import { FieldSchema } from "../model/forms/fields.model"
import { ViewsSchema } from "../model/views/views.model"

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

export const OTHER_MODULES = {
  forms: {
    name: "forms",
    schema: FormSchema,
  },
  fields: {
    name: "fields",
    schema: FieldSchema,
  },
  views: {
    name: "views",
    schema: ViewsSchema,
  },
}
