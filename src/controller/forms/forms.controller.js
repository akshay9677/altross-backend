import ModuleBase from "../module-base/moduleBase.controller"
import { MODULES, OTHER_MODULES } from "../../utils/moduleSchemas"
import { errorResponse } from "../../utils/responsehandler"
import { getModel } from "../getModel"
import { isEmpty } from "../../utils/validation"
import mongoose from "mongoose"

class Forms extends ModuleBase {
  constructor() {
    super({
      model: OTHER_MODULES["forms"].schema,
      modelName: OTHER_MODULES["forms"].name,
      lookupHash: null,
      moduleName: OTHER_MODULES["forms"].name,
    })
  }
  async defaultForm(moduleName, orgid) {
    let defaultFormSchema = mongoose.model(
      OTHER_MODULES["forms"].name,
      OTHER_MODULES["forms"].schema
    )
    let form = await defaultFormSchema.findOne({ moduleName })
    return form
  }
  async getModuleRecord(req, res) {
    try {
      let { orgid } = req.headers
      let currModel = this.getCurrDBModel(orgid)
      let { id, moduleName } = req.body
      let record

      if (!isEmpty(record) || !isEmpty(id)) {
        record = await currModel.findOne({ id: id, moduleName })
      } else if (isEmpty(moduleName)) {
        throw new Error("Module name is required")
      } else if (isEmpty(id)) {
        record = await this.defaultForm(moduleName, orgid)
      }

      record.groups = await this.spreadFieldsInForm(record, moduleName, orgid)

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
      let defaultFormObject = await this.defaultForm(moduleName, orgid)
      records.push(defaultFormObject)

      return res.status(200).json({
        data: records,
        count: totalCount + 1,
        error: null,
      })
    } catch (error) {
      return res.status(200).json(errorResponse(error))
    }
  }
  async spreadFieldsInForm(record, moduleName, orgid) {
    let { groups } = record || {}
    let fieldIds = []
    groups.forEach((group) => {
      let { fields } = group || {}
      fields.forEach((field) => {
        fieldIds.push(field.id)
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
      .filter((field) => !["__v", "_id", "id"].includes(field))
      .map((field) => {
        let { path, options, instance } = paths[field] || {}
        return { name: path, ...options, type: instance }
      })
    let finalFields = [...moduleFields, ...dbFields]

    let finalGroups = groups.map((group) => {
      let { fields } = group || {}
      return {
        fields: fields.map((field) => {
          return {
            ...field.toObject(),
            ...finalFields.find((currField) => currField.id === field.id),
          }
        }),
      }
    })

    return finalGroups
  }
}

export default Forms
