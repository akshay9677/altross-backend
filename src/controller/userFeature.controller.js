import ModuleBase from "./moduleBase.controller"
import { MODULES } from "../utils/moduleSchemas"
import { isEmpty } from "../utils/validation"
import { errorResponse } from "../utils/responsehandler"

const LookupHash = {
  users: { ...MODULES.users, preFill: true },
  features: { ...MODULES.features, preFill: true },
}

class UserFeature extends ModuleBase {
  constructor() {
    super(
      MODULES["userFeature"].schema,
      MODULES["userFeature"].name,
      LookupHash,
      MODULES["userFeature"].name
    )
  }
  async isActive(req, res) {
    try {
      let { orgid } = req.headers
      let { userId, featureId } = req.body

      if (isEmpty(userId)) throw new Error("User Id is required")
      if (isEmpty(featureId)) throw new Error("Feature Id is required")

      let currModel = this.getCurrDBModel(orgid)

      let record = await currModel.findOne({ userId, featureId })

      if (isEmpty(record))
        throw new Error("No association is found for the given id's")

      let { status } = record

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
