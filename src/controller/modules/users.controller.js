import ModuleBase from "../module-base/moduleBase.controller"
import { MODULES } from "../../utils/moduleSchemas"
import { getId, isEmpty } from "../../utils/validation"
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
  async createRecord(req, res) {
    try {
      let { orgid } = req.headers
      let currModel = this.getCurrDBModel(orgid)
      let param = req.body
      let totalCount = getId()

      param = { ...param, id: totalCount + 1 }

      if (!isEmpty(param.userGroup)) {
        let additionalFields = await this.getFeatureValues(orgid, param)
        param = { ...additionalFields, ...param }
      }

      let record = await this.createHandler({ orgid, currModel, param })

      return res.status(200).json({
        data: record,
        error: null,
      })
    } catch (error) {
      return res.status(200).json(errorResponse(error))
    }
  }

  async updateRecord(req, res) {
    try {
      let { orgid } = req.headers
      let currModel = this.getCurrDBModel(orgid)
      let param = req.body
      let { id, data } = param

      if (!isEmpty(data.userGroup)) {
        let additionalFields = await this.getFeatureValues(orgid, data)
        data = { ...additionalFields, ...data }
      }

      let oldRecord = await currModel.findOne({ id })
      await this.removeLookupRecords(
        oldRecord,
        data,
        currModel,
        orgid,
        this.moduleName
      )

      let record = await this.updateHandler({
        orgid,
        currModel,
        param: { condition: { id }, data },
        moduleName: this.moduleName,
        executeMiddleWare: !this.hideWorkflow,
      })

      let actualRecord = { ...record._doc, ...data }
      await this.createLookupRecords(
        actualRecord,
        currModel,
        orgid,
        this.moduleName
      )
      return res.status(200).json({
        data: actualRecord,
        error: null,
      })
    } catch (error) {
      return res.status(200).json(errorResponse(error))
    }
  }
  async getFeatureValues(orgid, param) {
    let userGroupId = dlv(param, "userGroup.0")

    let { name: userGroupName, schema: userGroupSchema } =
      MODULES["userGroup"] || {}
    let userGroupModel = getModel(orgid, userGroupName, userGroupSchema)
    let currUserGroup = await userGroupModel.findOne({ id: userGroupId })

    let featureGroupId = dlv(currUserGroup, "featureGroup.0")

    let { name: featureGroupName, schema: featureGroupSchema } =
      MODULES["featureGroup"] || {}
    let featureGroupModel = getModel(
      orgid,
      featureGroupName,
      featureGroupSchema
    )
    let currFeatureGroup = await featureGroupModel.findOne({
      id: featureGroupId,
    })

    let features = dlv(currFeatureGroup, "features")

    if (!isEmpty(features) && !isEmpty(featureGroupId))
      return { features, featureGroup: [featureGroupId] }
    else return {}
  }
  async isActive(req, res) {
    try {
      let { orgid } = req.headers
      let { userId, featureId, resource } = req.body

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

      let { conditions, conditionMatcher } = featureRecord
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
          let { key, value, operator, dataType, featureGroup } = condition
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
              return selectedOperator.action(actualValue, value)
            }
          } else {
            return false
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
