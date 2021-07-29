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
  // only one feature group
  async beforeCreateHook({ data }) {
    if (!isEmpty(data.featureGroup)) {
      let { featureGroup } = data || {}
      if (featureGroup.length > 1)
        throw new Error("A user group can have only one feature group")
    }
  }
  // only one feature group
  async beforeUpdateHook({ data, condition, orgid }) {
    let currModel = this.getCurrDBModel(orgid)
    let currUserGroup = await currModel.findOne(condition)
    let { featureGroup } = currUserGroup
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
  }
  async afterUpdateHook({ data, orgid, condition }) {
    if (!isEmpty(data.users) || !isEmpty(data.featureGroup)) {
      let users, features, featureGroupId
      let currModel = this.getCurrDBModel(orgid)
      let currUserGroup = await currModel.findOne(condition)

      if (!isEmpty(data.users)) {
        users = data.users
      } else {
        users = currUserGroup.users
      }

      if (!isEmpty(data.featureGroup)) {
        featureGroupId = dlv(data, "featureGroup.0")
      } else {
        featureGroupId = dlv(currUserGroup, "featureGroup.0")
      }

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

      features = dlv(featureGroupData, "features", [])

      if (!isEmpty(features) && !isEmpty(users))
        await this.updateUsersWithFeatures({
          users,
          features,
          featureGroup: featureGroupId,
          orgid,
        })
    }
  }
  async afterCreateHook({ data, orgid }) {
    if (!isEmpty(data) && !isEmpty(data.featureGroup) && !isEmpty(data.users)) {
      let { users } = data

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

      let features = dlv(featureGroupData, "features")

      if (!isEmpty(features))
        await this.updateUsersWithFeatures({
          users,
          features,
          orgid,
          featureGroup: featureGroupId,
        })
    }
  }
  async updateUsersWithFeatures({ users, features, featureGroup, orgid }) {
    let { name: usersName, schema: usersSchema } = MODULES["users"] || {}
    let usersModel = getModel(orgid, usersName, usersSchema)
    let params = {}

    if (!isEmpty(features)) params["features"] = features
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
