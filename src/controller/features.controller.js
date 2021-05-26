import ModuleBase from "./moduleBase.controller"
import { MODULES } from "../utils/moduleSchemas"
import { errorResponse } from "../utils/responsehandler"
import { getModel } from "./getModel"
import { isEmpty } from "../utils/validation"

const LookupHash = {
  projects: { ...MODULES.projects },
}

class Features extends ModuleBase {
  constructor() {
    super(
      MODULES["features"].schema,
      MODULES["features"].name,
      LookupHash,
      MODULES["features"].name
    )
  }
  async associateUsers(req, res) {
    try {
      let { orgid } = req.headers
      let { id, users } = req.body

      if (isEmpty(id)) throw new Error("Feature Id is required")

      if (isEmpty(users)) throw new Error("User Ids are required")

      let records = await this.associateRecords(
        orgid,
        id,
        "featureId",
        users,
        "users",
        MODULES.users,
        "userId"
      )

      let { name, schema } = MODULES["userFeature"]
      let userFeatureModel = getModel(orgid, name, schema)

      let finalDbRecords = await userFeatureModel.create(records)

      return res.status(200).json({
        data: finalDbRecords,
        error: null,
      })
    } catch (error) {
      return res.status(200).json(errorResponse(error))
    }
  }
}

export default Features
