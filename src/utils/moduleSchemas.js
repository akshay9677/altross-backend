import { FormSchema } from "../model/forms/forms.model"
import { FieldSchema } from "../model/forms/fields.model"
import { ViewsSchema } from "../model/views/views.model"
import { ProjectSchema } from "../model/modules/projects.model"
import { UsersSchema } from "../model/modules/users.model"
import { PermissionModel } from "../model/modules/permissions.model"
import { UserFeatureSchema } from "../model/modules/userFeature.model"
import { PermissionGroupModel } from "../model/modules/permissionGroup.model"
import { UserGroupModel } from "../model/modules/userGroup.model"
import { NotificationSchema } from "../model/workflows/notifications.model"
import { JobsSchema } from "../model/other/jobs.model"
import { WorkflowSchema } from "../model/workflows/workflow.model"

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
  permissions: {
    name: "permissions",
    schema: PermissionModel,
    displayName: "Permissions",
  },
  userFeature: {
    name: "userFeature",
    schema: UserFeatureSchema,
    displayName: "User Features",
    hidden: true,
  },
  permissionGroup: {
    name: "permissionGroup",
    schema: PermissionGroupModel,
    displayName: "permission Groups",
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
  workflows: {
    name: "workflows",
    schema: WorkflowSchema,
  },
}
