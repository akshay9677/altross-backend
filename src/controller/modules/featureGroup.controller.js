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

class FeatureGroup extends ModuleBase {
  constructor() {
    super({
      model: MODULES["featureGroup"].schema,
      modelName: MODULES["featureGroup"].name,
      lookupHash: LookupHash,
      moduleName: MODULES["featureGroup"].name,
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
      let featureGroupId
      let isFeatureChanged, isUserChanged
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
          featureGroupId = data.id
        }
      }
      if (!isEmpty(data.users)) {
        users = [...users, ...data.users]
        featureGroupId = data.id
        isUserChanged = true
      }

      if (!isEmpty(data.permissions)) {
        permissions = [...permissions, ...data.permissions]
        isFeatureChanged = true
      }

      if (isEmpty(users) || isEmpty(permissions)) {
        let { name: featureGroupName, schema: featureGroupSchema } =
          MODULES["featureGroup"] || {}
        let featureGroupModel = getModel(
          orgid,
          featureGroupName,
          featureGroupSchema
        )
        let featureGroupRecord = await featureGroupModel.findOne({
          id: data.id,
        })

        if (isEmpty(users)) {
          let currUsers = dlv(featureGroupRecord, "users", [])
          users = [...users, ...currUsers]
        }

        if (isEmpty(permissions)) {
          let currFeatures = dlv(featureGroupRecord, "permissions", [])
          permissions = [...permissions, ...currFeatures]
        }
      }

      if (!isEmpty(users) && !isEmpty(permissions)) {
        if (isUserChanged && isFeatureChanged) {
          this.updateUsersWithFeatures({
            users,
            permissions,
            featureGroup: featureGroupId,
            orgid,
          })
        } else if (isUserChanged) {
          this.updateUsersWithFeatures({
            users,
            permissions,
            featureGroup: featureGroupId,
            orgid,
          })
        } else if (isFeatureChanged) {
          this.updateFeaturesWithUsers({
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
  async updateFeaturesWithUsers({ users, permissions, orgid }) {
    let { name: featuresName, schema: featuresSchema } =
      MODULES["permissions"] || {}
    let featuresModel = getModel(orgid, featuresName, featuresSchema)
    let params = {}

    if (!isEmpty(users)) params["users"] = users

    permissions.forEach(async (permission) => {
      await this.updateHandler({
        orgid,
        currModel: featuresModel,
        param: {
          condition: { id: permission },
          data: params,
        },
        moduleName: featuresName,
        executeMiddleWare: true,
      })
    })
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

export default FeatureGroup
