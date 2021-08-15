import ModuleBase from "../module-base/moduleBase.controller"
import { MODULES } from "../../utils/moduleSchemas"
import { getModel } from "../getModel"
import dlv from "dlv"
import { isEmpty } from "../../utils/validation"

const LookupHash = {
  users: { ...MODULES.users, preFill: true },
  projects: { ...MODULES.projects },
  permissionGroup: { ...MODULES.permissionGroup, preFill: true },
}

class UserGroup extends ModuleBase {
  constructor() {
    super({
      model: MODULES["userGroup"].schema,
      modelName: MODULES["userGroup"].name,
      lookupHash: LookupHash,
      moduleName: MODULES["userGroup"].name,
    })
  }
  // only one permission group
  async beforeCreateHook({ data }) {
    if (!isEmpty(data.permissionGroup)) {
      let { permissionGroup, adminUsers, users } = data || {}
      if (permissionGroup.length > 1)
        throw new Error("A user group can have only one permission group")

      let isInvalidUser
      adminUsers.forEach((adminUser) => {
        if (!users.includes(adminUser)) isInvalidUser = true
      })

      if (isInvalidUser)
        throw new Error("A admin user is not a configured user for this group")
    }
  }
  // only one permission group
  async beforeUpdateHook({ data, condition, orgid }) {
    let currModel = this.getCurrDBModel(orgid)
    let currUserGroup = await currModel.findOne(condition)
    let {
      permissionGroup,
      users: currUsers,
      adminUsers: currAdminUsers,
    } = currUserGroup
    if (
      !isEmpty(data.permissionGroup) &&
      Array.isArray(data.permissionGroup) &&
      data.permissionGroup.length > 1
    ) {
      throw new Error("A user group can have only one permission group")
    } else if (
      !Array.isArray(data.permissionGroup) &&
      !isEmpty(permissionGroup) &&
      !isEmpty(data.permissionGroup)
    ) {
      throw new Error("A user group can have only one permission group")
    }

    if (data.adminUsers)
      currAdminUsers = [...currAdminUsers, ...data.adminUsers]
    if (data.users) currUsers = [...currUsers, ...data.users]

    let isInvalidUser
    currAdminUsers.forEach((adminUser) => {
      if (!currUsers.includes(adminUser)) isInvalidUser = true
    })

    if (isInvalidUser)
      throw new Error("A admin user is not a configured user for this group")
  }
  async afterUpdateHook({ data, orgid, condition }) {
    if (!isEmpty(data.adminUsers) || !isEmpty(data.permissionGroup)) {
      let users, permissions, permissionGroupId
      let currModel = this.getCurrDBModel(orgid)
      let currUserGroup = await currModel.findOne(condition)

      let adminUsers = dlv(currUserGroup, "adminUsers")

      users = adminUsers
      permissionGroupId = dlv(currUserGroup, "permissionGroup.0")

      let { name: permissionGroupName, schema: permissionGroupSchema } =
        MODULES["permissionGroup"] || {}
      let permissionGroupModel = getModel(
        orgid,
        permissionGroupName,
        permissionGroupSchema
      )
      let permissionGroupData = await permissionGroupModel.findOne({
        id: permissionGroupId,
      })

      permissions = dlv(permissionGroupData, "permissions", [])

      if (!isEmpty(permissions) && !isEmpty(users))
        await this.updateUsersWithPermissions({
          users,
          permissions,
          permissionGroup: permissionGroupId,
          orgid,
        })
    }
  }
  async afterCreateHook({ data, orgid }) {
    if (
      !isEmpty(data) &&
      !isEmpty(data.permissionGroup) &&
      !isEmpty(data.users) &&
      !isEmpty(data.adminUsers)
    ) {
      let adminUsers = dlv(data, "adminUsers")
      let users = adminUsers

      let permissionGroupId = dlv(data, "permissionGroup.0")

      let { name: permissionGroupName, schema: permissionGroupSchema } =
        MODULES["permissionGroup"] || {}
      let permissionGroupModel = getModel(
        orgid,
        permissionGroupName,
        permissionGroupSchema
      )
      let permissionGroupData = await permissionGroupModel.findOne({
        id: permissionGroupId,
      })

      let permissions = dlv(permissionGroupData, "permissions")

      if (!isEmpty(permissions))
        await this.updateUsersWithPermissions({
          users,
          permissions,
          orgid,
          permissionGroup: permissionGroupId,
        })
    }
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

export default UserGroup
