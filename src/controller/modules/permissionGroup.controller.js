import ModuleBase from "../module-base/moduleBase.controller"
import { MODULES } from "../../utils/moduleSchemas"
import { getModel } from "../getModel"
import { isEmpty } from "../../utils/validation"
import dlv from "dlv"

const LookupHash = {
  users: { ...MODULES.users, preFill: true },
  permissions: { ...MODULES.permissions, preFill: true },
  projects: { ...MODULES.projects },
  userGroup: { ...MODULES.userGroup, preFill: true },
}

class PermissionGroup extends ModuleBase {
  constructor() {
    super({
      model: MODULES["permissionGroup"].schema,
      modelName: MODULES["permissionGroup"].name,
      lookupHash: LookupHash,
      moduleName: MODULES["permissionGroup"].name,
    })
  }
  async afterCreateHook({ data, orgid }) {
    if (
      !isEmpty(data.userGroup) ||
      !isEmpty(data.users) ||
      !isEmpty(data.permissions)
    ) {
      let users = []
      let permissions = []
      let permissionGroupId
      let isPermissionChanged, isUserChanged
      if (!isEmpty(data.userGroup)) {
        let { userGroup } = data || {}
        if (!isEmpty(userGroup)) {
          let { name: userGroupName, schema: userGroupSchema } =
            MODULES["userGroup"] || {}
          let userGroupModel = getModel(orgid, userGroupName, userGroupSchema)
          // if (!Array.isArray(userGroup)) userGroup = [userGroup]
          for (let currUserGrp of userGroup) {
            let userGroupRecord = await userGroupModel.findOne({
              id: currUserGrp,
            })

            let currUsers = dlv(userGroupRecord, "adminUsers", [])

            users = [...users, ...currUsers]
            if (!isEmpty(users)) isUserChanged = true
          }
          permissionGroupId = data.id
        }
      }
      if (!isEmpty(data.users)) {
        users = [...users, ...data.users]
        permissionGroupId = data.id
        isUserChanged = true
      }

      if (!isEmpty(data.permissions)) {
        permissions = [...permissions, ...data.permissions]
        isPermissionChanged = true
      }

      if (isEmpty(users) || isEmpty(permissions)) {
        let { name: permissionGroupName, schema: permissionGroupSchema } =
          MODULES["permissionGroup"] || {}
        let permissionGroupModel = getModel(
          orgid,
          permissionGroupName,
          permissionGroupSchema
        )
        let permissionGroupRecord = await permissionGroupModel.findOne({
          id: data.id,
        })

        if (isEmpty(users)) {
          let currUsers = dlv(permissionGroupRecord, "users", [])
          users = [...users, ...currUsers]
        }

        if (isEmpty(permissions)) {
          let currPermissions = dlv(permissionGroupRecord, "permissions", [])
          permissions = [...permissions, ...currPermissions]
        }
      }

      if (!isEmpty(users) && !isEmpty(permissions)) {
        if (isUserChanged && isPermissionChanged) {
          this.updateUsersWithPermissions({
            users,
            permissions,
            permissionGroup: permissionGroupId,
            orgid,
          })
        } else if (isUserChanged) {
          this.updateUsersWithPermissions({
            users,
            permissions,
            permissionGroup: permissionGroupId,
            orgid,
          })
        } else if (isPermissionChanged) {
          this.updatePermissionsWithUsers({
            users,
            permissions,
            orgid,
          })
        }
      }
    }
  }
  async afterUpdateHook({ data, orgid, condition }) {
    await this.afterCreateHook({ data: { ...data, ...condition }, orgid })
  }
  async updatePermissionsWithUsers({ users, permissions, orgid }) {
    let { name: permissionsName, schema: permissionsSchema } =
      MODULES["permissions"] || {}
    let permissionsModel = getModel(orgid, permissionsName, permissionsSchema)
    let params = {}

    if (!isEmpty(users)) params["users"] = users

    permissions.forEach(async (permission) => {
      await this.updateHandler({
        orgid,
        currModel: permissionsModel,
        param: {
          condition: { id: permission },
          data: params,
        },
        moduleName: permissionsName,
        executeMiddleWare: true,
      })
    })
  }
  async updateUsersWithPermissions({
    users,
    permissions,
    permissionGroup,
    orgid,
  }) {
    let { name: usersName, schema: usersSchema } = MODULES["users"] || {}
    let usersModel = getModel(orgid, usersName, usersSchema)
    let params = {}

    if (!isEmpty(permissions)) params["permissions"] = permissions
    if (!isEmpty(permissionGroup)) params["permissionGroup"] = [permissionGroup]

    users.forEach(async (user) => {
      await this.updateHandler({
        orgid,
        currModel: usersModel,
        param: {
          condition: { id: user },
          data: params,
        },
        moduleName: usersName,
        executeMiddleWare: true,
      })
    })
  }
}

export default PermissionGroup
