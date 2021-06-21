import { OTHER_MODULES } from "../../../utils/moduleSchemas"
import { errorResponse } from "../../../utils/responsehandler"
import ModuleBase from "../../module-base/moduleBase.controller"

class Notifications extends ModuleBase {
  constructor() {
    super({
      model: OTHER_MODULES["notifications"].schema,
      modelName: OTHER_MODULES["notifications"].name,
      moduleName: OTHER_MODULES["notifications"].name,
    })
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
