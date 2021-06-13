import ModuleBase from "../module-base/moduleBase.controller"
import { MODULES } from "../../utils/moduleSchemas"

import { isEmpty } from "../../utils/validation"
import { errorResponse } from "../../utils/responsehandler"

import { OPERATOR_HASH } from "../automations/workflows/workflow.execution"

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
      let { userId, featureId, resource, status: currStatus } = req.body

      if (isEmpty(userId)) throw new Error("User Id is required")
      if (isEmpty(featureId)) throw new Error("Feature Id is required")

      let currModel = this.getCurrDBModel(orgid)

      let record = await currModel.findOne({ userId, featureId })
      if (isEmpty(record))
        throw new Error("No association is found for the given id's")

      let { conditions, conditionMatcher } = record
      let status

      if (!isEmpty(conditions)) {
        let conditionsSatisfiedArray = conditions.map((condition) => {
          let { key, value, operator, dataType } = condition
          let actualValue = resource[key]
          if (
            !isEmpty(OPERATOR_HASH[dataType]) &&
            !isEmpty((OPERATOR_HASH[dataType] || {})[operator])
          ) {
            let selectedOperator = OPERATOR_HASH[dataType][operator]
            return selectedOperator.action(actualValue, value)
          }
        })

        let finalStatus = conditionsSatisfiedArray.reduce(
          (acc, curr, currIndex) => {
            let matcher = conditionMatcher[currIndex - 1]
            if (matcher === "and") return acc && curr
            else return acc || curr
          }
        )

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
}

export default UserFeature
