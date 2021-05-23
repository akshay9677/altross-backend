import ModuleBase from "./moduleBase.controller"
import { MODULES } from "../utils/moduleSchemas"

import { isEmpty } from "../utils/validation"
import { errorResponse } from "../utils/responsehandler"

const LookupHash = {
  orgs: { ...MODULES.orgs },
  users: { ...MODULES.users },
}

class Projects extends ModuleBase {
  constructor() {
    super(
      MODULES["projects"].schema,
      MODULES["projects"].name,
      LookupHash,
      MODULES["projects"].name
    )
  }
  async getModuleRecord(req, res) {
    try {
      let { orgid } = req.headers
      let currModel = this.getCurrDBModel(orgid)
      let { id } = req.body
      let params
      if (id) params["id"] = id
      let record = await currModel.findOne(params)

      if (isEmpty(record)) throw new Error("No record found for that Id")

      return res.status(200).json({
        data: record,
        error: null,
      })
    } catch (error) {
      return res.status(200).json(errorResponse(error))
    }
  }
}

export default Projects
