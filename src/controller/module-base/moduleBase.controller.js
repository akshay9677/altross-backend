import { errorResponse } from "../../utils/responsehandler"
import { getModel } from "../getModel"
import { isEmpty, getId } from "../../utils/validation"
import { executeEventMiddleWare } from "../automations/event-middleware/execute.middleware"
import { MODULES } from "../../utils/moduleSchemas"
import _ from "lodash"
import dlv from "dlv"
import { ValidationError } from "../../utils/errors"

class ModuleBase {
  constructor(props) {
    let { model, modelName, lookupHash, moduleName, hideWorkflow } = props
    this.model = model
    this.modelName = modelName
    this.lookupHash = lookupHash
    this.moduleName = moduleName
    this.hideWorkflow = hideWorkflow
  }

  getCurrDBModel(orgid) {
    let currModel = getModel(orgid, this.modelName, this.model)
    return currModel
  }
  getFieldForId(param) {
    let { name } = param
    return name
  }

  getMultiLookups(currModel) {
    let paths = dlv(currModel, "schema.paths")
    let fields = Object.keys(paths).filter((field) => {
      let { options } = paths[field] || {}
      let { lookup } = options || {}
      return lookup
    })
    return fields
  }

  async getModuleList(req, res) {
    try {
      let { orgid } = req.headers
      let currModel = this.getCurrDBModel(orgid)
      let param = req.body
      let { page, perPage, filter, sort } = param
      let totalCount, records

      if (page !== 0) page = page - 1
      else throw new Error("Page number cannot be zero")

      if (isEmpty(perPage)) perPage = 50
      if (isEmpty(filter)) {
        records = await currModel
          .find()
          .sort(sort)
          .skip(Math.abs(perPage * page))
          .limit(perPage)
        totalCount = await currModel
          .find()
          .sort(sort)
          .skip(Math.abs(perPage * page))
          .limit(perPage)
          .countDocuments()
      } else {
        Object.keys(filter).forEach((key) => {
          if (Array.isArray(filter[key]) && !key.includes("$")) {
            filter[key] = { $all: filter[key] }
          }
        })
        records = await currModel
          .find(filter)
          .sort(sort)
          .skip(Math.abs(perPage * page))
          .limit(perPage)

        totalCount = await currModel
          .find(filter)
          .sort(sort)
          .skip(Math.abs(perPage * page))
          .limit(perPage)
          .countDocuments()
      }

      records = records.map((record) => {
        let { _id } = record || {}
        let timeStamp = _id.getTimestamp()
        return { ...record._doc, createdTime: timeStamp }
      })

      let meta = await this.getModuleLookupsList(records, currModel, orgid)

      return res.status(200).json({
        data: records,
        count: totalCount,
        meta: meta,
        error: null,
      })
    } catch (error) {
      return res.status(error.status || 500).json(errorResponse(error))
    }
  }

  async getModuleLookupsList(records, currModel, orgid) {
    let lookups = this.getMultiLookups(currModel)
    let meta = {}
    let { lookupHash } = this
    let uniqueLookupIds = {}

    if (!isEmpty(lookups)) {
      for (const lookup of lookups) {
        uniqueLookupIds[lookup] = new Set()
        records.forEach((record) => {
          if (!isEmpty(record[lookup])) {
            uniqueLookupIds[lookup].add(...record[lookup])
            record[lookup].forEach((value) =>
              uniqueLookupIds[lookup].add(value)
            )
          }
        })
        uniqueLookupIds[lookup] = Array.from(uniqueLookupIds[lookup])
        let { preFill } = lookupHash[lookup] || {}
        if (!isEmpty(lookupHash[lookup]) && preFill) {
          let { name, schema } = lookupHash[lookup]
          let currLookupModel = getModel(orgid, name, schema)
          let updatePromise = await currLookupModel.find({
            id: { $in: uniqueLookupIds[lookup] },
          })
          meta[lookup] = updatePromise
        }
      }
    }

    return meta
  }

  async getModuleRecord(req, res) {
    try {
      let { orgid } = req.headers
      let currModel = this.getCurrDBModel(orgid)
      let { id } = req.body
      let record = await currModel.findOne({ id: id })

      if (isEmpty(record)) throw new Error("No record found for that Id")
      let { _id } = record

      let timeStamp = _id.getTimestamp()

      record = { ...record._doc, createdTime: timeStamp }
      let meta = await this.getModuleLookupsList([record], currModel, orgid)

      return res.status(200).json({
        data: record,
        error: null,
        meta,
      })
    } catch (error) {
      return res.status(error.status || 500).json(errorResponse(error))
    }
  }

  async getModuleFields(req, res) {
    try {
      let { orgid } = req.headers
      let currModel = this.getCurrDBModel(orgid)
      let {
        schema: { paths },
      } = currModel || {}
      let fields = Object.keys(paths)
        .filter((field) => !["__v", "_id"].includes(field))
        .map((field) => {
          let { path, options, instance } = paths[field] || {}
          return { name: path, ...options, type: instance }
        })

      return res.status(200).json({
        data: fields,
        error: null,
      })
    } catch (error) {
      return res.status(error.status || 500).json(errorResponse(error))
    }
  }

  // Create Record Handler
  async createHandler({ orgid, currModel, param }) {
    const record = await currModel.create(param)
    await this.createLookupRecords(record, currModel, orgid, this.moduleName)

    if (!isEmpty(record) && !isEmpty(this.moduleName) && !this.hideWorkflow)
      executeEventMiddleWare(param, "create", this.moduleName, orgid, this)

    return record
  }
  async createLookupRecords(record, currModel, orgid, currModuleName) {
    let lookups = this.getMultiLookups(currModel)
    let { id } = record
    let promise = []
    let { lookupHash } = this
    if (!isEmpty(lookups)) {
      lookups.forEach((lookup) => {
        if (!isEmpty(record[lookup])) {
          let { name, schema } = !isEmpty(lookupHash[lookup])
            ? lookupHash[lookup]
            : MODULES[lookup]
          let currLookupModel = getModel(orgid, name, schema)
          let updatePromise = currLookupModel.updateMany(
            { id: { $in: record[lookup] } },
            { $addToSet: { [currModuleName]: [id] } }
          )

          promise.push(updatePromise)
        }
      })
    }

    return Promise.all(promise)
  }
  async createRecord(req, res) {
    try {
      let { orgid } = req.headers
      let currModel = this.getCurrDBModel(orgid)
      let param = req.body
      let totalCount = getId()

      param = { ...param, id: totalCount + 1 }

      if (!isEmpty(this.beforeCreateHook)) {
        await this.beforeCreateHook({ data: param, orgid })
      }

      let record = await this.createHandler({ orgid, currModel, param })

      if (!isEmpty(this.afterCreateHook)) {
        await this.afterCreateHook({
          data: { ...param, id: totalCount + 1 },
          orgid,
        })
      }

      return res.status(201).json({
        data: record,
        error: null,
      })
    } catch (error) {
      return res.status(error.status || 500).json(errorResponse(error))
    }
  }

  // Update Record Handlers

  async updateHandler({
    orgid,
    currModel,
    param,
    moduleName,
    executeMiddleWare,
  }) {
    let { condition, data } = param
    let oldRecord = await currModel.findOne(condition)

    await this.removeLookupRecords(
      oldRecord,
      data,
      currModel,
      orgid,
      moduleName
    )

    let record = await currModel.findOneAndUpdate(condition, data, {
      new: true,
    })

    if (isEmpty(record)) throw new Error("No record found for the given ID")

    if (!isEmpty(moduleName) && executeMiddleWare) {
      executeEventMiddleWare(
        { ...record._doc, ...data },
        "update",
        moduleName,
        orgid,
        this
      )
    }

    let actualRecord = { ...record._doc, ...data }
    await this.createLookupRecords(actualRecord, currModel, orgid, moduleName)

    return record
  }

  async removeLookupRecords(
    oldRecord = {},
    newRecord = {},
    currModel,
    orgid,
    currModuleName
  ) {
    let lookups = this.getMultiLookups(currModel)
    let promise = []
    let { lookupHash } = this

    for (let lookup of lookups) {
      let oldRecordLookup = oldRecord[lookup]
      let newRecordLookup = newRecord[lookup]
      let { id } = oldRecord
      let diff = _.difference(oldRecordLookup, newRecordLookup)

      if (oldRecordLookup && newRecordLookup && !isEmpty(diff)) {
        let { name, schema } = !isEmpty(lookupHash[lookup])
          ? lookupHash[lookup]
          : MODULES[lookup]
        let currLookupModel = getModel(orgid, name, schema)
        diff = diff.filter((val) => !isEmpty(val))
        let updatePromise = await currLookupModel.updateMany(
          {
            id: { $in: diff },
          },
          { $pull: { [currModuleName]: id } }
        )

        promise.push(updatePromise)
      }
    }
    return Promise.all(promise)
  }

  async updateRecord(req, res) {
    try {
      let { orgid } = req.headers
      let currModel = this.getCurrDBModel(orgid)
      let param = req.body
      let { id, data } = param

      if (isEmpty(id))
        throw new ValidationError("Record id is required for updating")

      if (!isEmpty(this.beforeUpdateHook)) {
        await this.beforeUpdateHook({ data, orgid, condition: { id } })
      }

      let record = await this.updateHandler({
        orgid,
        currModel,
        param: { condition: { id }, data },
        moduleName: this.moduleName,
        executeMiddleWare: !this.hideWorkflow,
      })

      if (!isEmpty(this.afterUpdateHook)) {
        await this.afterUpdateHook({ data, orgid, condition: { id } })
      }

      return res.status(200).json({
        data: record,
        error: null,
      })
    } catch (error) {
      return res.status(error.status || 500).json(errorResponse(error))
    }
  }
  // Delete Record Handler
  async deleteHandler({ orgid, currModel, id }) {
    let records = await currModel.find({ id: { $in: id } })
    if (isEmpty(records))
      throw new Error("No records were found for the given ID")
    if (this.beforeDeleteHook) this.beforeDeleteHook(records, orgid)

    if (!isEmpty(this.moduleName) && !this.hideWorkflow)
      executeEventMiddleWare(records, "delete", this.moduleName, orgid, this)

    await currModel.deleteMany({ id: { $in: id } })

    this.removeDeletedLookupRecords(
      Array.isArray(id) ? id : [id],
      currModel,
      orgid
    )
  }

  async removeDeletedLookupRecords(id, currModel, orgid) {
    let lookups = this.getMultiLookups(currModel)
    if (Array.isArray(id)) {
      for (let lookup of lookups) {
        let { name, schema } = this.lookupHash[lookup] || {}
        if (this.lookupHash[lookup]) {
          let currLookupModel = getModel(orgid, name, schema)
          await currLookupModel.updateMany(
            { [this.modelName.toLowerCase()]: { $in: id } },
            { $pullAll: { [this.modelName.toLowerCase()]: id } }
          )
        }
      }
    }
  }
  async deleteRecord(req, res) {
    try {
      let { orgid } = req.headers
      let currModel = this.getCurrDBModel(orgid)
      let { id } = req.body

      if (isEmpty(id))
        throw new ValidationError("Record id is required for deleting")

      this.deleteHandler({ orgid, currModel, id })

      return res.status(204).json({
        data: "Deleted successfully",
        error: null,
      })
    } catch (error) {
      return res.status(error.status || 500).json(errorResponse(error))
    }
  }
}

export default ModuleBase
