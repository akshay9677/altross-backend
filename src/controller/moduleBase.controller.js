import { errorResponse } from "../utils/responsehandler"
import { getModel } from "./getModel"

class ModuleBase {
  constructor(model, modelName) {
    this.model = model
    this.modelName = modelName
  }

  getCurrDBModel(orgid) {
    let currModel = getModel(orgid, this.modelName, this.model)
    return currModel
  }

  async getModuleList(req, res) {
    try {
      let { orgid } = req.headers
      let currModel = this.getCurrDBModel(orgid)
      let param = req.body
      let { page, perPage } = param
      const totalCount = await this.getTotalCount()
      let records = await currModel
        .find()
        .sort({ name: 1 })
        .skip(Math.abs(perPage * page))
        .limit(perPage)
      return res.status(200).json({
        data: records,
        count: totalCount,
        error: null,
      })
    } catch (error) {
      return res.status(500).json(errorResponse(error))
    }
  }

  async createRecord(req, res) {
    try {
      let { orgid } = req.headers
      let currModel = this.getCurrDBModel(orgid)
      let param = req.body
      let record = await currModel.create(param)
      return res.status(200).json({
        data: record,
        error: null,
      })
    } catch (error) {
      return res.status(500).json(errorResponse(error))
    }
  }

  async getTotalCount() {
    let { orgid } = req.headers
    let currModel = this.getCurrDBModel(orgid)
    const totalCount = await currModel.countDocuments()
    return totalCount
  }
}

export default ModuleBase
