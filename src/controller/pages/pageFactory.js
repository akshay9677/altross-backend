import { errorResponse } from "../../utils/responsehandler"
import { isEmpty } from "../../utils/validation"
import subscriptionPages from "./subscriptionPages"

const MODULE_PAGES_HASH = {
  subscriptions: subscriptionPages,
}

export const pageFactory = (req, res) => {
  try {
    let { moduleName } = req.body
    if (isEmpty(moduleName)) throw new Error("Module name is required")
    let pages = MODULE_PAGES_HASH[moduleName]()

    return res.status(200).json({
      data: pages,
      error: null,
    })
  } catch (error) {
    return res.status(200).json(errorResponse(error))
  }
}
