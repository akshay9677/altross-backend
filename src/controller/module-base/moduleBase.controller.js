import { errorResponse } from "../../utils/responsehandler"
import { getModel } from "../getModel"
import { isEmpty, getId } from "../../utils/validation"
import { executeEventMiddleWare } from "../event-middleware/execute.middleware"
import _ from "lodash"

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
    let {
      schema: { paths },
    } = currModel || {}
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

      if (isEmpty(filter)) {
        records = await currModel
          .find()
          .sort(sort)
          .skip(Math.abs(perPage * page))
          .limit(perPage)
      } else {
        records = await currModel
          .find(filter)
          .sort(sort)
          .skip(Math.abs(perPage * page))
          .limit(perPage)
      }
      totalCount = records.length

      let meta = await this.getModuleLookupsList(records, currModel, orgid)

      return res.status(200).json({
        data: records,
        count: totalCount,
        meta: meta,
        error: null,
      })
    } catch (error) {
      return res.status(200).json(errorResponse(error))
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

      return res.status(200).json({
        data: record,
        error: null,
      })
    } catch (error) {
      return res.status(200).json(errorResponse(error))
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
      return res.status(200).json(errorResponse(error))
    }
  }

  async createRecord(req, res) {
    try {
      let { orgid } = req.headers
      let currModel = this.getCurrDBModel(orgid)
      let param = req.body
      let totalCount = getId(this.getFieldForId(param), 9999)

      param = { ...param, id: totalCount + 1 }

      const record = await currModel.create(param)
      await this.createLookupRecords(record, currModel, orgid)

      if (!isEmpty(record) && !isEmpty(this.moduleName) && !this.hideWorkflow)
        executeEventMiddleWare(param, "create", this.moduleName, orgid)

      return res.status(200).json({
        data: record,
        error: null,
      })
    } catch (error) {
      return res.status(200).json(errorResponse(error))
    }
  }

  async createLookupRecords(record, currModel, orgid) {
    let lookups = this.getMultiLookups(currModel)
    let { id } = record
    let promise = []
    let { lookupHash } = this
    if (!isEmpty(lookups) && !isEmpty(lookupHash)) {
      lookups.forEach((lookup) => {
        if (!isEmpty(record[lookup]) && !isEmpty(lookupHash[lookup])) {
          let { name, schema } = lookupHash[lookup]
          let currLookupModel = getModel(orgid, name, schema)
          let updatePromise = currLookupModel.updateMany(
            { id: { $in: record[lookup] } },
            { $addToSet: { [this.modelName.toLowerCase()]: id } }
          )

          promise.push(updatePromise)
        }
      })
    }

    return Promise.all(promise)
  }

  async updateRecord(req, res) {
    try {
      let { orgid } = req.headers
      let currModel = this.getCurrDBModel(orgid)
      let param = req.body
      let { id, data } = param
      let record = await currModel.findOneAndUpdate({ id: id }, data)

      if (isEmpty(record)) throw new Error("No record found for the given ID")

      if (!isEmpty(this.moduleName) && !this.hideWorkflow) {
        executeEventMiddleWare(
          { ...record._doc, ...data },
          "update",
          this.moduleName,
          orgid
        )
      }

      await this.removeLookupRecords(record, data, currModel, orgid)

      let actualRecord = { ...record._doc, ...data }
      await this.createLookupRecords(actualRecord, currModel, orgid)

      return res.status(200).json({
        data: actualRecord,
        error: null,
      })
    } catch (error) {
      return res.status(200).json(errorResponse(error))
    }
  }

  async removeLookupRecords(oldRecord, newRecord, currModel, orgid) {
    let lookups = this.getMultiLookups(currModel)
    let promise = []

    for (let lookup of lookups) {
      let oldRecordLookup = oldRecord[lookup]
      let newRecordLookup = newRecord[lookup]
      let { id } = oldRecord

      if (
        oldRecordLookup &&
        newRecordLookup &&
        oldRecordLookup.length > newRecordLookup.length
      ) {
        let diff = _.difference(oldRecordLookup, newRecordLookup)
        let { name, schema } = this.lookupHash[lookup] || {}
        if (this.lookupHash[lookup]) {
          let currLookupModel = getModel(orgid, name, schema)
          let updatePromise = await currLookupModel.updateMany(
            {
              id: { $in: diff },
            },
            { $pull: { [this.modelName.toLowerCase()]: id } }
          )

          promise.push(updatePromise)
        }
      }
    }
    return Promise.all(promise)
  }

  async deleteRecord(req, res) {
    try {
      let { orgid } = req.headers
      let currModel = this.getCurrDBModel(orgid)
      let { id } = req.body

      let records = await currModel.find({ id: { $in: id } })

      if (isEmpty(records))
        throw new Error("No records were found for the given ID")

      if (!isEmpty(this.moduleName) && !this.hideWorkflow)
        executeEventMiddleWare(records, "delete", this.moduleName, orgid)

      await currModel.deleteMany({ id: { $in: id } })

      this.removeDeletedLookupRecords(id, currModel, orgid)

      return res.status(200).json({
        data: "Deleted successfully",
        error: null,
      })
    } catch (error) {
      return res.status(200).json(errorResponse(error))
    }
  }

  async removeDeletedLookupRecords(id, currModel, orgid) {
    let lookups = this.getMultiLookups(currModel)
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
  async associateRecords(
    orgid,
    nativeId,
    nativeRefId,
    foreignIds,
    foreignModuleName,
    foreignSchema,
    foreignRefId
  ) {
    // native is the current module whereas foreign is the lookup to which association
    // has to be created

    let { moduleName: nativeModuleName } = this || {}
    let nativeModel = this.getCurrDBModel(orgid)
    let { name, schema } = foreignSchema
    let foreignModel = getModel(orgid, name, schema)

    let nativeRecord = await nativeModel.findOne({ id: nativeId })
    let foreignRecords = await foreignModel.find({ id: { $in: foreignIds } })

    return foreignRecords.map((foreignRecord) => {
      let {
        name: foreignName,
        id: foreignId,
        [foreignRefId]: foreignRef,
      } = foreignRecord || {}
      let { name: nativeName, [nativeRefId]: nativeRef } = nativeRecord || {}
      return {
        name: nativeName,
        id: getId(nativeName + foreignName, 9999),
        status: "ACTIVE",
        [nativeModuleName]: [nativeId],
        [foreignModuleName]: [foreignId],
        [foreignRefId]: foreignRef,
        [nativeRefId]: nativeRef,
      }
    })
  }
}

export default ModuleBase