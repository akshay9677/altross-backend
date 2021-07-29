import { FormSchema } from "../model/forms/forms.model"
import { FieldSchema } from "../model/forms/fields.model"
import { ViewsSchema } from "../model/views/views.model"
import { ProjectSchema } from "../model/modules/projects.model"
import { UsersSchema } from "../model/modules/users.model"
import { FeaturesModel } from "../model/modules/features.model"
import { UserFeatureSchema } from "../model/modules/userFeature.model"
import { FeatureGroupModel } from "../model/modules/featureGroup.model"
import { UserGroupModel } from "../model/modules/userGroup.model"
import { NotificationSchema } from "../model/workflows/notifications.model"
import { JobsSchema } from "../model/other/jobs.model"

export const MODULES = {
  projects: {
    name: "projects",
    schema: ProjectSchema,
    displayName: "Projects",
  },
  users: {
    name: "users",
    schema: UsersSchema,
    displayName: "Users",
  },
  features: {
    name: "features",
    schema: FeaturesModel,
    displayName: "Features",
  },
  userFeature: {
    name: "userFeature",
    schema: UserFeatureSchema,
    displayName: "User Features",
    hidden: true,
  },
  featureGroup: {
    name: "featureGroup",
    schema: FeatureGroupModel,
    displayName: "Feature Groups",
  },
  userGroup: {
    name: "userGroup",
    schema: UserGroupModel,
    displayName: "User Group",
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
  jobs: {
    name: "jobs",
    schema: JobsSchema,
  },
}
