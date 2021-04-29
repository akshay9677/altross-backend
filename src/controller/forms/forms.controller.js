import ModuleBase from "../moduleBase.controller"
import { MODULES, OTHER_MODULES } from "../../utils/moduleSchemas"
import { errorResponse } from "../../utils/responsehandler"
import { getModel } from "../getModel"
import { isEmpty } from "../../utils/validation"

class Forms extends ModuleBase {
  constructor() {
    super(
      OTHER_MODULES["forms"].schema,
      OTHER_MODULES["forms"].name,
      OTHER_MODULES["forms"].name
    )
  }
  defaultForm(moduleName) {
    let { paths } = MODULES[moduleName].schema || {}
    let moduleFields = Object.keys(paths)
      .filter((field) => !["__v", "_id"].includes(field))
      .map((field) => {
        let { path, options, instance } = paths[field] || {}
        return { name: path, ...options, type: instance }
      })
    let form = {
      name: "Default",
      displayName: "Default",
      id: 1,
      moduleName,
      groups: [{ fields: moduleFields }],
    }
    return form
  }
  async getModuleRecord(req, res) {
    try {
      let { orgid } = req.headers
      let currModel = this.getCurrDBModel(orgid)
      let { id, moduleName } = req.body
      let record = await currModel.findOne({ id: id, moduleName })
      let finalFields = []

      if (!isEmpty(record) || !isEmpty(id)) {
        let { groups } = record || {}
        let fieldIds = []
        groups.forEach((group) => {
          let { fields } = group || {}
          fields.forEach((field) => {
            fieldIds.push(field)
          })
        })

        let fieldsModel = getModel(
          orgid,
          OTHER_MODULES["fields"].name,
          OTHER_MODULES["fields"].schema
        )

        let dbFields = await fieldsModel.find({
          id: { $in: fieldIds },
          moduleName,
        })

        let { paths } = MODULES[moduleName].schema || {}
        let moduleFields = Object.keys(paths)
          .filter((field) => !["__v", "_id"].includes(field))
          .map((field) => {
            let { path, options, instance } = paths[field] || {}
            return { name: path, ...options, type: instance }
          })
        finalFields = [...moduleFields, ...dbFields]

        groups = groups.map((group) => {
          let { fields } = group || {}
          return {
            fields: fields.map((field) =>
              finalFields.find((currField) => currField.id === field)
            ),
          }
        })
        record.groups = groups
      } else if (isEmpty(moduleName)) {
        throw new Error("Module name is required")
      } else if (isEmpty(id)) {
        record = this.defaultForm(moduleName)
      }

      return res.status(200).json({
        data: record,
        error: null,
      })
    } catch (error) {
      return res.status(200).json(errorResponse(error))
    }
  }
  async getModuleList(req, res) {
    try {
      let { orgid } = req.headers
      let currModel = this.getCurrDBModel(orgid)
      let param = req.body
      let { page, perPage, moduleName } = param
      let totalCount, records

      records = await currModel
        .find({ moduleName })
        .sort({ name: 1 })
        .skip(Math.abs(perPage * page))
        .limit(perPage)

      totalCount = await currModel.countDocuments()

      records.push(this.defaultForm(moduleName))

      return res.status(200).json({
        data: records,
        count: totalCount + 1,
        error: null,
      })
    } catch (error) {
      return res.status(200).json(errorResponse(error))
    }
  }
}

export default Forms
