import ModuleBase from "../moduleBase.controller"
import { OTHER_MODULES, MODULES } from "../../utils/moduleSchemas"
import { errorResponse } from "../../utils/responsehandler"

class Fields extends ModuleBase {
  constructor() {
    super(
      OTHER_MODULES["fields"].schema,
      OTHER_MODULES["fields"].name,
      OTHER_MODULES["fields"].name
    )
  }
  async getModuleList(req, res) {
    try {
      let { orgid } = req.headers
      let fieldsModel = this.getCurrDBModel(orgid)
      let param = req.body
      let { page, perPage, moduleName } = param
      let records

      records = await fieldsModel
        .find({ moduleName })
        .sort({ name: 1 })
        .skip(Math.abs(perPage * page))
        .limit(perPage)

      let { paths } = MODULES[moduleName].schema
      let fields = Object.keys(paths)
        .filter((field) => !["__v", "_id", "id"].includes(field))
        .map((field) => {
          let { path, options, instance } = paths[field] || {}
          return { name: path, ...options, type: instance, mainField: true }
        })

      return res.status(200).json({
        data: [...fields, ...records],
        error: null,
      })
    } catch (error) {
      return res.status(200).json(errorResponse(error))
    }
  }
}

export default Fields
