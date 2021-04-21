import { WorkflowSchema } from "../../model/workflows/workflow.model"
import { WorkflowExecution } from "../workflows/workflow.execution"
import { isEmpty } from "../../utils/validation"

const AUTOMATION_MODULES = [
  {
    name: "Workflows",
    schema: WorkflowSchema,
    action: WorkflowExecution,
  },
]

export const executeEventMiddleWare = (record, event, moduleName, orgid) => {
  AUTOMATION_MODULES.forEach((module) => {
    if (Array.isArray(record)) {
      record.forEach((currRecord) => {
        module.action(
          !isEmpty(currRecord._doc) ? currRecord._doc : currRecord,
          event,
          moduleName,
          orgid,
          module
        )
      })
    } else {
      module.action(record, event, moduleName, orgid, module)
    }
  })
}
