import { FormSchema } from "../model/forms/forms.model"
import { FieldSchema } from "../model/forms/fields.model"
import { ViewsSchema } from "../model/views/views.model"
import { ProjectSchema } from "../model/projects.model"
import { OrgSchema } from "../model/orgs.model"
import { UsersSchema } from "../model/users.model"
import { FeaturesModel } from "../model/features.model"
import { UserFeatureSchema } from "../model/userFeature.model"
import { FeatureGroupModel } from "../model/featureGroup.model"

export const MODULES = {
  projects: {
    name: "projects",
    schema: ProjectSchema,
  },
  orgs: {
    name: "orgs",
    schema: OrgSchema,
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
}
