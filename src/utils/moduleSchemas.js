import { FormSchema } from "../model/forms/forms.model"
import { FieldSchema } from "../model/forms/fields.model"
import { ViewsSchema } from "../model/views/views.model"
import { ProjectSchema } from "../model/modules/projects.model"
import { UsersSchema } from "../model/modules/users.model"
import { FeaturesModel } from "../model/modules/features.model"
import { UserFeatureSchema } from "../model/modules/userFeature.model"
import { FeatureGroupModel } from "../model/modules/featureGroup.model"
import { NotificationSchema } from "../model/workflows/notifications.model"

export const MODULES = {
  projects: {
    name: "projects",
    schema: ProjectSchema,
  },
  users: {
    name: "users",
    schema: UsersSchema,
  },
  features: {
    name: "features",
    schema: FeaturesModel,
  },
  userFeature: {
    name: "userFeature",
    schema: UserFeatureSchema,
  },
  featureGroup: {
    name: "featureGroup",
    schema: FeatureGroupModel,
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
  notifications: {
    name: "notifications",
    schema: NotificationSchema,
  },
}
