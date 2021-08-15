import ModuleBase from "../module-base/moduleBase.controller"
import { MODULES } from "../../utils/moduleSchemas"
import { getModel } from "../getModel"
import dlv from "dlv"
import { isEmpty } from "../../utils/validation"

const LookupHash = {
  users: { ...MODULES.users, preFill: true },
  projects: { ...MODULES.projects },
  featureGroup: { ...MODULES.featureGroup, preFill: true },
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
    if (!isEmpty(data.featureGroup)) {
      let { featureGroup, adminUsers, users } = data || {}
      if (featureGroup.length > 1)
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
      featureGroup,
      users: currUsers,
      adminUsers: currAdminUsers,
    } = currUserGroup
    if (
      !isEmpty(data.featureGroup) &&
      Array.isArray(data.featureGroup) &&
      data.featureGroup.length > 1
    ) {
      throw new Error("A user group can have only one feature group")
    } else if (
      !Array.isArray(data.featureGroup) &&
      !isEmpty(featureGroup) &&
      !isEmpty(data.featureGroup)
    ) {
      throw new Error("A user group can have only one feature group")
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
    if (!isEmpty(data.adminUsers) || !isEmpty(data.featureGroup)) {
      let users, permissions, featureGroupId
      let currModel = this.getCurrDBModel(orgid)
      let currUserGroup = await currModel.findOne(condition)

      let adminUsers = dlv(currUserGroup, "adminUsers")

      users = adminUsers
      featureGroupId = dlv(currUserGroup, "featureGroup.0")

      let { name: featureGroupName, schema: featureGroupSchema } =
        MODULES["featureGroup"] || {}
      let featureGroupModel = getModel(
        orgid,
        featureGroupName,
        featureGroupSchema
      )
      let featureGroupData = await featureGroupModel.findOne({
        id: featureGroupId,
      })

      permissions = dlv(featureGroupData, "permissions", [])

      if (!isEmpty(permissions) && !isEmpty(users))
        await this.updateUsersWithFeatures({
          users,
          permissions,
          featureGroup: featureGroupId,
          orgid,
        })
    }
  }
  async afterCreateHook({ data, orgid }) {
    if (
      !isEmpty(data) &&
      !isEmpty(data.featureGroup) &&
      !isEmpty(data.users) &&
      !isEmpty(data.adminUsers)
    ) {
      let adminUsers = dlv(data, "adminUsers")
      let users = adminUsers

      let featureGroupId = dlv(data, "featureGroup.0")

      let { name: featureGroupName, schema: featureGroupSchema } =
        MODULES["featureGroup"] || {}
      let featureGroupModel = getModel(
        orgid,
        featureGroupName,
        featureGroupSchema
      )
      let featureGroupData = await featureGroupModel.findOne({
        id: featureGroupId,
      })

      let permissions = dlv(featureGroupData, "permissions")

      if (!isEmpty(permissions))
        await this.updateUsersWithFeatures({
          users,
          permissions,
          orgid,
          featureGroup: featureGroupId,
        })
    }
  }
  async updateUsersWithFeatures({ users, permissions, featureGroup, orgid }) {
    let { name: usersName, schema: usersSchema } = MODULES["users"] || {}
    let usersModel = getModel(orgid, usersName, usersSchema)
    let params = {}

    if (!isEmpty(permissions)) params["permissions"] = permissions
    if (!isEmpty(featureGroup)) params["featureGroup"] = [featureGroup]

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
