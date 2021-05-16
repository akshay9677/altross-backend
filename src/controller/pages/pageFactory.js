import { errorResponse } from "../../utils/responsehandler"
import { isEmpty } from "../../utils/validation"
import subscriptionPages from "./subscriptionPages"
import usersPages from "./usersPages"

const MODULE_PAGES_HASH = {
  subscriptions: subscriptionPages,
  users: usersPages,
}

export const pageFactory = (req, res) => {
  try {
    let { moduleName } = req.body
    if (isEmpty(moduleName)) throw new Error("Module name is required")
    if (isEmpty(MODULE_PAGES_HASH[moduleName])) {
      throw new Error("Pages are not defined for this module")
    }
    let pages = MODULE_PAGES_HASH[moduleName]()

    return res.status(200).json({
      data: pages,
      error: null,
    })
  } catch (error) {
    return res.status(200).json(errorResponse(error))
  }
}
