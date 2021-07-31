import ModuleBase from "../module-base/moduleBase.controller"
import { MODULES } from "../../utils/moduleSchemas"
import { isEmpty } from "../../utils/validation"
import { errorResponse } from "../../utils/responsehandler"
import dlv from "dlv"
import { getModel } from "../getModel"
import { OPERATOR_HASH } from "../automations/workflows/workflow.execution"

const LookupHash = {
  projects: { ...MODULES.projects },
  featureGroup: { ...MODULES.featureGroup, preFill: true },
  userGroup: { ...MODULES.userGroup, preFill: true },
  features: { ...MODULES.features, preFill: true },
}

class Users extends ModuleBase {
  constructor() {
    super({
      model: MODULES["users"].schema,
      modelName: MODULES["users"].name,
      lookupHash: LookupHash,
      moduleName: MODULES["users"].name,
    })
  }
  // only one user group and feature group
  beforeCreateHook({ data }) {
    if (!isEmpty(data.featureGroup)) {
      let { featureGroup } = data || {}
      if (featureGroup.length > 1)
        throw new Error("A user can have only one feature group")
    }
    if (!isEmpty(data.userGroup)) {
      let { userGroup } = data || {}
      if (userGroup.length > 1)
        throw new Error("A user can have only one user group")
    }
  }
  // only one user group and feature group
  async beforeUpdateHook({ data, condition, orgid }) {
    let currModel = this.getCurrDBModel(orgid)
    let currUserGroup = await currModel.findOne(condition)
    if (
      !isEmpty(data.featureGroup) &&
      Array.isArray(data.featureGroup) &&
      data.featureGroup.length > 1
    ) {
      throw new Error("A user can have only one feature group")
    } else if (
      !Array.isArray(data.featureGroup) &&
      !isEmpty(currUserGroup.featureGroup) &&
      !isEmpty(data.featureGroup)
    ) {
      throw new Error("A user can have only one feature group")
    }

    if (
      !isEmpty(data.userGroup) &&
      Array.isArray(data.userGroup) &&
      data.userGroup.length > 1
    ) {
      throw new Error("A user can have only one user group")
    } else if (
      !Array.isArray(data.userGroup) &&
      !isEmpty(currUserGroup.userGroup) &&
      !isEmpty(data.userGroup)
    ) {
      throw new Error("A user can have only one user group")
    }
  }
  async afterCreateHook({ data, orgid }) {
    let featureGroupId
    if (!isEmpty(data.userGroup)) {
      let { name: userGroupName, schema: userGroupSchema } =
        MODULES["userGroup"] || {}
      let userGroupModel = getModel(orgid, userGroupName, userGroupSchema)
      let userGroupRecord = await userGroupModel.findOne({
        id: dlv(data, "userGroup.0"),
      })

      let currFeatureGroup = dlv(userGroupRecord, "featureGroup.0")
      let { id } = data
      let adminUsers = dlv(userGroupRecord, "adminUsers")

      if (adminUsers.includes(id)) featureGroupId = currFeatureGroup
    }

    if (isEmpty(featureGroupId) && !isEmpty(data.featureGroup)) {
      featureGroupId = dlv(data, "featureGroup.0")
    }

    if (!isEmpty(featureGroupId) && !isEmpty(data.id)) {
      let { name: featureGroupName, schema: featureGroupSchema } =
        MODULES["featureGroup"] || {}
      let featureGroupModel = getModel(
        orgid,
        featureGroupName,
        featureGroupSchema
      )

      let featureGroupRecord = await featureGroupModel.findOne({
        id: featureGroupId,
      })

      let features = dlv(featureGroupRecord, "features")

      if (!isEmpty(features) && !isEmpty(data.id))
        this.updateUsersWithFeatures({
          users: [data.id],
          features,
          featureGroup: featureGroupId,
          orgid,
        })
    }
  }
  async afterUpdateHook({ data, orgid, condition }) {
    await this.afterCreateHook({ data: { ...data, ...condition }, orgid })
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
  async isActive(req, res) {
    try {
      let { orgid } = req.headers
      let { userId, featureId, resource, actor } = req.body

      if (isEmpty(userId)) throw new Error("User Id is required")
      if (isEmpty(featureId)) throw new Error("Feature Id is required")

      let currStatus
      // get feature group from user
      let currModel = this.getCurrDBModel(orgid)
      let userRecord = await currModel.findOne({ userId })
      let currFeatureGroup = dlv(userRecord, "featureGroup.0", null)
      // get conditions from feature record
      let featuresModel = getModel(
        orgid,
        MODULES["features"].name,
        MODULES["features"].schema
      )
      let featureRecord = await featuresModel.findOne({ featureId })

      let { conditions, conditionMatcher, users: featureUsers } = featureRecord
      let status

      if (this.userFeatureCheck(userRecord, featureRecord)) {
        currStatus = "ACTIVE"
      } else {
        currStatus = "EXPIRED"
      }

      if (
        !isEmpty(conditions) &&
        !isEmpty(conditionMatcher) &&
        !isEmpty(resource)
      ) {
        let conditionsSatisfiedArray = conditions.map((condition) => {
          let { key, value, operator, dataType, featureGroup, actorKey } =
            condition
          let actualValue = resource[key]
          if (
            isEmpty(featureGroup) ||
            (!isEmpty(featureGroup) && featureGroup === currFeatureGroup)
          ) {
            if (
              !isEmpty(OPERATOR_HASH[dataType]) &&
              !isEmpty((OPERATOR_HASH[dataType] || {})[operator])
            ) {
              let selectedOperator = OPERATOR_HASH[dataType][operator]
              if (!isEmpty(actor) && !isEmpty(actorKey)) {
                let val = actor[actorKey]
                return selectedOperator.action(actualValue, val)
              } else {
                return selectedOperator.action(actualValue, value)
              }
            }
          } else {
            let { id: currUserId } = userRecord

            if (featureUsers.includes(currUserId)) return true
            else return false
          }
        })

        for (let i = 0; i < conditionMatcher.length; i++) {
          let charAtIndex = conditionMatcher.charAt(i)
          if (this.isNumeric(charAtIndex)) {
            let actualVal =
              conditionsSatisfiedArray[conditionMatcher.charAt(i) - 1]

            if (!isEmpty(actualVal)) {
              conditionMatcher = this.replaceChar(
                conditionMatcher,
                `${actualVal}`,
                i
              )
            } else {
              conditionMatcher = this.replaceChar(
                conditionMatcher,
                `${false}`,
                i
              )
            }
          }
        }

        conditionMatcher = conditionMatcher.replace(/and/g, "&&")
        conditionMatcher = conditionMatcher.replace(/or/g, "||")

        let finalStatus = eval(conditionMatcher)

        if (finalStatus) {
          status = "ACTIVE"
        } else {
          status = "EXPIRED"
        }
      } else {
        status = currStatus
      }

      return res.status(200).json({
        data: { status },
        error: null,
      })
    } catch (error) {
      return res.status(200).json(errorResponse(error))
    }
  }
  userFeatureCheck(user, feature) {
    let { features } = user || {}
    let { id } = feature
    return (features || []).includes(id)
  }
  isNumeric(str) {
    if (typeof str != "string") return false
    return !isNaN(str) && !isNaN(parseFloat(str))
  }

  replaceChar(origString, replaceChar, index) {
    let firstPart = origString.substr(0, index)
    let lastPart = origString.substr(index + 1)

    let newString = firstPart + replaceChar + lastPart
    return newString
  }
}

export default Users
