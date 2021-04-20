import { WorkflowSchema } from "../../model/workflows/workflow.model"
import { WorkflowExecution } from "../workflows/workflow.execution"

const AUTOMATION_MODULES = [
  {
    name: "Workflows",
    schema: WorkflowSchema,
    action: WorkflowExecution,
  },
]

export const executeEventMiddleWare = (record, event, moduleName, orgid) => {
  AUTOMATION_MODULES.forEach((module) => {
    module.action(record, event, moduleName, orgid, module)
  })
}
