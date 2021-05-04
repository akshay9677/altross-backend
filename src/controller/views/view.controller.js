import ModuleBase from "../moduleBase.controller"
import { MODULES, OTHER_MODULES } from "../../utils/moduleSchemas"
import { getModel } from "../getModel"
import { isEmpty } from "../../utils/validation"
import mongoose from "mongoose"
import { errorResponse } from "../../utils/responsehandler"

class Views extends ModuleBase {
  constructor() {
    super(
      OTHER_MODULES["views"].schema,
      OTHER_MODULES["views"].name,
      OTHER_MODULES["views"].name
    )
  }
  async defaultView(moduleName) {
    let defaultViewsSchema = mongoose.model(
      OTHER_MODULES["views"].name,
      OTHER_MODULES["views"].schema
    )
    let form = await defaultViewsSchema.findOne({ moduleName })
    return form
  }
  async getModuleRecord(req, res) {
    try {
      let { orgid } = req.headers
      let currModel = this.getCurrDBModel(orgid)
      let { id, moduleName } = req.body
      let record

      if (isEmpty(moduleName)) {
        throw new Error("Module name is required")
      } else if (isEmpty(id)) {
        record = await this.defaultView(moduleName)
      } else {
        record = await currModel.findOne({ id: id, moduleName })
      }

      if (isEmpty(record)) {
        throw new Error("Default view is not added for this module")
      }

      let fields = await this.spreadFieldsInViews(record, moduleName, orgid)

      record = { ...record.toObject(), fields }

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
      let records

      records = await currModel
        .find({ moduleName })
        .sort({ name: 1 })
        .skip(Math.abs(perPage * page))
        .limit(perPage)

      let defaultViewObj = await this.defaultView(moduleName, orgid)
      records.push(defaultViewObj)

      return res.status(200).json({
        data: records,
        error: null,
      })
    } catch (error) {
      return res.status(200).json(errorResponse(error))
    }
  }
  async spreadFieldsInViews(record, moduleName, orgid) {
    let { fields: fieldIds } = record || {}

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
      .filter((field) => !["__v", "_id", "id"].includes(field))
      .map((field) => {
        let { path, options, instance } = paths[field] || {}
        return { name: path, ...options, type: instance }
      })
    let finalFields = [...moduleFields, ...dbFields]

    let filteredFields = finalFields.filter((field) =>
      fieldIds.includes(field.id)
    )

    return filteredFields
  }
}

export default Views
