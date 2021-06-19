import ModuleBase from "../module-base/moduleBase.controller"
import { MODULES } from "../../utils/moduleSchemas"

import { isEmpty } from "../../utils/validation"
import { errorResponse } from "../../utils/responsehandler"

import { OPERATOR_HASH } from "../automations/workflows/workflow.execution"
import { getModel } from "../getModel"
import dlv from "dlv"

const LookupHash = {
  users: { ...MODULES.users, preFill: true },
  features: { ...MODULES.features, preFill: true },
}

class UserFeature extends ModuleBase {
  constructor() {
    super({
      model: MODULES["userFeature"].schema,
      modelName: MODULES["userFeature"].name,
      lookupHash: LookupHash,
      moduleName: MODULES["userFeature"].name,
    })
  }
  async isActive(req, res) {
    try {
      let { orgid } = req.headers
      let { userId, featureId, resource } = req.body

      if (isEmpty(userId)) throw new Error("User Id is required")
      if (isEmpty(featureId)) throw new Error("Feature Id is required")

      let currModel = this.getCurrDBModel(orgid)

      let record = await currModel.findOne({ userId, featureId })
      let { status: currStatus } = record
      // get feature group from user
      let usersModel = getModel(
        orgid,
        MODULES["users"].name,
        MODULES["users"].schema
      )
      let userRecord = await usersModel.findOne({ userId })
      let currFeatureGroup = dlv(userRecord, "featureGroup.0", null)
      // get conditions from feature record
      let featuresModel = getModel(
        orgid,
        MODULES["features"].name,
        MODULES["features"].schema
      )
      let featureRecord = await featuresModel.findOne({ featureId })
      if (isEmpty(record))
        throw new Error("No association is found for the given id's")

      let { conditions, conditionMatcher } = featureRecord
      let status

      if (!isEmpty(conditions) && !isEmpty(conditionMatcher)) {
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

        if (status !== currStatus)
          await currModel.findOneAndUpdate({ userId, featureId }, { status })
      } else {
        let { status: currStatus } = record

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

export default UserFeature
