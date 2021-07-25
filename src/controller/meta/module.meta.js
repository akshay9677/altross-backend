import { errorResponse } from "../../utils/responsehandler"
import { MODULES } from "../../utils/moduleSchemas"

const moduleList = (req, res) => {
  try {
    let moduleList = Object.keys(MODULES)
      .filter((module) => !MODULES[module].hidden)
      .map((module) => MODULES[module])
    return res.status(200).json({
      data: moduleList,
      error: null,
    })
  } catch (error) {
    return res.status(200).json(errorResponse(error))
  }
}

export { moduleList }
