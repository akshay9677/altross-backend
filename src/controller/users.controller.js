import ModuleBase from "./moduleBase.controller"
import { MODULES } from "../utils/moduleSchemas"
import { errorResponse } from "../utils/responsehandler"
import { getModel } from "./getModel"

const LookupHash = {
  orgs: { ...MODULES.orgs, preFill: true },
  projects: { ...MODULES.projects },
}

class Users extends ModuleBase {
  constructor() {
    super(
      MODULES["users"].schema,
      MODULES["users"].name,
      LookupHash,
      MODULES["users"].name
    )
  }

  async associateFeatures(req, res) {
    try {
      let { orgid } = req.headers
      // let currModel = this.getCurrDBModel(orgid)
      let { id, features } = req.body

      if (isEmpty(id)) throw new Error("User Id is required")

      if (isEmpty(features)) throw new Error("Feature Ids are required")

      let records = await this.associateRecords(
        orgid,
        id,
        "userId",
        features,
        "features",
        MODULES.features,
        "featureId"
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

export default Users
