import { isEmpty } from "../../../utils/validation"
import { OTHER_MODULES } from "../../../utils/moduleSchemas"
import { getModel } from "../../getModel"
import { getId } from "../../../utils/validation"

const ACTIONS_HASH = {
  1: async ({ recordContext, currModel, action }) => {
    let { id } = recordContext || {}
    let { actionDetails } = action || {}
    let { fieldChange } = actionDetails || {}
    if (!isEmpty(id) && !isEmpty(fieldChange)) {
      let record = await currModel.findOneAndUpdate({ id }, fieldChange)
      return record
    }
  },
  2: async ({ recordContext, action, event, moduleName, orgid }) => {
    let { id, projects } = recordContext || {}
    let { actionDetails } = action || {}
    let { subject, title } = actionDetails
    let actionData = { record: id, moduleName, projects }
    let param = { subject, title, event, actionData, id: getId() }

    let notificationModel = getModel(
      orgid,
      OTHER_MODULES["notifications"].name,
      OTHER_MODULES["notifications"].schema
    )
    await notificationModel.create(param)
    return param
  },
}

export default ACTIONS_HASH
