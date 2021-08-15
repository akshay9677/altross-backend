import ModuleBase from "../module-base/moduleBase.controller"
import { MODULES } from "../../utils/moduleSchemas"

import { isEmpty } from "../../utils/validation"
import { errorResponse } from "../../utils/responsehandler"

const LookupHash = {
  users: { ...MODULES.users },
  userGroup: { ...MODULES.userGroup },
  permissionGroup: { ...MODULES.permissionGroup },
  permissions: { ...MODULES.permissions },
}

class Projects extends ModuleBase {
  constructor() {
    super({
      model: MODULES["projects"].schema,
      modelName: MODULES["projects"].name,
      lookupHash: LookupHash,
      moduleName: MODULES["projects"].name,
    })
  }
  async getModuleRecord(req, res) {
    try {
      let { orgid } = req.headers
      let currModel = this.getCurrDBModel(orgid)
      let { id } = req.body

      if (isEmpty(id)) throw new Error("Id is required")

      let params = {}
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
