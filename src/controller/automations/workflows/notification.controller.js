import { OTHER_MODULES } from "../../../utils/moduleSchemas"
import { errorResponse } from "../../../utils/responsehandler"
import ModuleBase from "../../module-base/moduleBase.controller"
import { isEmpty } from "../../../utils/validation"

class Notifications extends ModuleBase {
  constructor() {
    super({
      model: OTHER_MODULES["notifications"].schema,
      modelName: OTHER_MODULES["notifications"].name,
      moduleName: OTHER_MODULES["notifications"].name,
    })
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
      totalCount = await currModel.countDocuments()

      records = records.map((record) => {
        let { _id } = record || {}
        let timeStamp = _id.getTimestamp()
        return { ...record._doc, createdTime: timeStamp }
      })

      return res.status(200).json({
        data: records.reverse(),
        count: totalCount,
        meta: null,
        error: null,
      })
    } catch (error) {
      return res.status(200).json(errorResponse(error))
    }
  }
  async seen(req, res) {
    try {
      let { orgid } = req.headers
      let currModel = this.getCurrDBModel(orgid)

      await currModel.updateMany(
        { notificationStatus: "UNSEEN" },
        { notificationStatus: "SEEN" }
      )
      return res.status(200).json({
        data: { message: "Records seen status updated" },
        error: null,
      })
    } catch (error) {
      return res.status(200).json(errorResponse(error))
    }
  }
  async seenCount(req, res) {
    try {
      let { orgid } = req.headers
      let currModel = this.getCurrDBModel(orgid)

      let count = await currModel.countDocuments({
        notificationStatus: "UNSEEN",
      })
      return res.status(200).json({
        data: { count },
        error: null,
      })
    } catch (error) {
      return res.status(200).json(errorResponse(error))
    }
  }
}

export default Notifications
