import { isEmpty } from "../../utils/validation"
import { getModel } from "../getModel"
import { MODULES } from "../../utils/moduleSchemas"
import ACTIONS_HASH from "../automation-actions/automation.actions"
import mongoose from "mongoose"

const OPERATOR_HASH = {
  Number: {
    10: {
      name: "equal",
      action: (recordValue, conditionValue) => recordValue === conditionValue,
    },
    11: {
      name: "notequal",
      action: (recordValue, conditionValue) => recordValue !== conditionValue,
    },
    12: {
      name: "greaterthan",
      action: (recordValue, conditionValue) => recordValue > conditionValue,
    },
    13: {
      name: "greaterthanequal",
      action: (recordValue, conditionValue) =>
        recordValue > conditionValue || recordValue === conditionValue,
    },
    14: {
      name: "lesserthan",
      action: (recordValue, conditionValue) => recordValue < conditionValue,
    },
    15: {
      name: "lesserthanequal",
      action: (recordValue, conditionValue) =>
        recordValue < conditionValue || recordValue === conditionValue,
    },
    16: {
      name: "empty",
      action: (recordValue) => isEmpty(recordValue),
    },
    17: {
      name: "notempty",
      action: (recordValue) => !isEmpty(recordValue),
    },
  },
  String: {
    20: {
      name: "equal",
      action: (recordValue, conditionValue) => recordValue === conditionValue,
    },
    21: {
      name: "notequal",
      action: (recordValue, conditionValue) => recordValue !== conditionValue,
    },
    22: {
      name: "contains",
      action: (recordValue, conditionValue) =>
        recordValue.includes(conditionValue),
    },
    23: {
      name: "notcontains",
      action: (recordValue, conditionValue) =>
        !recordValue.includes(conditionValue),
    },
    24: {
      name: "startswith",
      action: (recordValue, conditionValue) =>
        recordValue.startsWith(conditionValue),
    },
    25: {
      name: "endswith",
      action: (recordValue, conditionValue) =>
        recordValue.endsWith(conditionValue),
    },
    26: {
      name: "empty",
      action: (recordValue) => isEmpty(recordValue),
    },
    27: {
      name: "notempty",
      action: (recordValue) => !isEmpty(recordValue),
    },
  },
  Boolean: {
    30: {
      name: "empty",
      action: (recordValue) => isEmpty(recordValue),
    },
    31: {
      name: "notempty",
      action: (recordValue) => !isEmpty(recordValue),
    },
    32: {
      name: "true",
      action: (recordValue) => recordValue,
    },
    33: {
      name: "false",
      action: (recordValue) => !recordValue,
    },
  },
}

const getMatchingWorkflows = async ({
  orgid,
  name,
  workflowSchema,
  moduleName,
  paths,
  event,
}) => {
  let workflowModel = getModel(orgid, name, workflowSchema)
  let defaultWorkflowmodel = mongoose.model(name, workflowSchema)
  // find the workflow with module name, field type and name
  let moduleFieldMatchRecords = await workflowModel.find({
    moduleName: moduleName,
    "conditions.field": {
      $in: Object.keys(paths).filter((prop) => {
        return prop !== "_id" || prop !== "__v"
      }),
    },
    event: event,
  })

  let defaultFieldMatchRecords = await defaultWorkflowmodel.find({
    moduleName: moduleName,
    "conditions.field": {
      $in: Object.keys(paths).filter((prop) => {
        return prop !== "_id" || prop !== "__v"
      }),
    },
    event: event,
  })
  return [...defaultFieldMatchRecords, ...moduleFieldMatchRecords]
}

export const WorkflowExecution = async (
  record,
  event,
  moduleName,
  orgid,
  { name, schema: workflowSchema }
) => {
  let currModel = getModel(
    orgid,
    MODULES[moduleName].name,
    MODULES[moduleName].schema
  )
  let {
    schema: { paths },
  } = currModel || {}

  let currModuleFields = Object.keys(paths)
    .filter((field) => field !== "__v")
    .map((field) => {
      return paths[field]
    })

  let moduleFieldMatchRecords = await getMatchingWorkflows({
    orgid,
    name,
    workflowSchema,
    moduleName,
    paths,
    event,
  })

  // let workflowModel = getModel(orgid, name, workflowSchema)
  // // find the workflow with module name, field type and name
  // let moduleFieldMatchRecords = await workflowModel.find({
  //   moduleName: moduleName,
  //   "conditions.field": {
  //     $in: Object.keys(paths).filter((prop) => {
  //       return prop !== "_id" || prop !== "__v"
  //     }),
  //   },
  //   event: event,
  // })

  let actionExecutionArray = []

  moduleFieldMatchRecords.forEach((currRecord) => {
    let {
      conditions,
      matchCondition,
      actions,
      event: workflowEvent,
    } = currRecord || []
    if (workflowEvent === event) {
      let conditionsSatisfiedArray = conditions.map((condition) => {
        let { field, operator, value } = condition || {}
        let fieldObj = currModuleFields.find(
          (currField) => currField.path === field
        )
        let { instance } = fieldObj
        let operatorsSelected

        if (
          !isEmpty(OPERATOR_HASH[instance]) &&
          !isEmpty((OPERATOR_HASH[instance] || {})[operator])
        )
          operatorsSelected = OPERATOR_HASH[instance][operator]

        if (!isEmpty(operatorsSelected)) {
          return operatorsSelected.action(record[field], value)
        } else {
          return false
        }
      })

      if (matchCondition === "or") {
        let canExecuteAction = conditionsSatisfiedArray.some((value) => value)
        if (canExecuteAction) actionExecutionArray.push(...actions)
      } else if (matchCondition === "and") {
        let canExecuteAction = conditionsSatisfiedArray.every((value) => value)
        if (canExecuteAction) actionExecutionArray.push(...actions)
      }
    }
  })

  actionExecutionArray.forEach((action) => {
    let { actionType } = action
    if (!isEmpty(ACTIONS_HASH[actionType])) {
      let currAction = ACTIONS_HASH[actionType]
      currAction(record, currModel, action)
    }
  })
}
