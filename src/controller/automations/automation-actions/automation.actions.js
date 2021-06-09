import { isEmpty } from "../../../utils/validation"

const ACTIONS_HASH = {
  1: async (recordContext, currModel, action) => {
    let { id } = recordContext || {}
    let { actionDetails } = action || {}
    let { fieldChange } = actionDetails || {}
    if (!isEmpty(id) && !isEmpty(fieldChange)) {
      let record = await currModel.findOneAndUpdate({ id }, fieldChange)
      return record
    }
  },
}

export default ACTIONS_HASH
