import { isEmpty } from "../../../utils/validation"
import { OTHER_MODULES } from "../../../utils/moduleSchemas"
import { getModel } from "../../getModel"
import { getId } from "../../../utils/validation"
import nodeMailer from "nodemailer"
import nodeScheduler from "node-schedule"
import { getDateAfterCount } from "../../../utils/jobs.utils"

const UPDATE_ACTION_HANDLER = async ({
  currThis,
  orgid,
  fieldChange,
  id,
  moduleName,
  currModel,
}) => {
  let { beforeUpdateHook, afterUpdateHook, updateHandler } = currThis
  if (!isEmpty(beforeUpdateHook)) {
    await beforeUpdateHook.call(currThis, {
      data: fieldChange,
      orgid,
      condition: { id },
    })
  }

  let record = await updateHandler.call(currThis, {
    orgid,
    currModel,
    param: { condition: { id }, data: fieldChange },
    moduleName: moduleName,
    executeMiddleWare: true,
  })

  if (!isEmpty(afterUpdateHook)) {
    await afterUpdateHook.call(currThis, {
      data: fieldChange,
      orgid,
      condition: { id },
    })
  }
  return record
}

const ACTIONS_HASH = {
  1: async ({
    recordContext,
    action,
    currThis,
    orgid,
    moduleName,
    currModel,
  }) => {
    let { id } = recordContext || {}
    let { actionDetails } = action || {}
    let { fieldChange } = actionDetails || {}
    if (!isEmpty(id) && !isEmpty(fieldChange)) {
      let record = UPDATE_ACTION_HANDLER({
        currThis,
        orgid,
        moduleName,
        currModel,
        id,
        fieldChange,
      })
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
  3: async ({ action }) => {
    let { actionDetails } = action || {}
    let { to, subject, title } = actionDetails
    let data = { message: "Email sent successfully" }
    to.forEach((toString) => {
      let transporter = nodeMailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAIN_EMAIL,
          pass: process.env.EMAIL_PWD,
        },
      })
      let mailOptions = {
        from: process.env.MAIN_EMAIL,
        to: toString,
        subject: title,
        html: subject,
      }

      transporter.sendMail(mailOptions, function (error) {
        if (error) {
          data = error
        }
      })
    })
    return data
  },
  4: async ({
    recordContext,
    action,
    currThis,
    orgid,
    moduleName,
    currModel,
  }) => {
    let { id } = recordContext || {}
    let { scheduleDetails, actionDetails } = action || {}
    let { fieldChange } = actionDetails || {}
    let { type } = scheduleDetails || {}
    let job
    let uniqueId = getId()
    let cron
    if (type === "FIXED_DATE") {
      let { date } = scheduleDetails || {}
      if (!isEmpty(date)) {
        cron = new Date(date)
        job = nodeScheduler.scheduleJob(`${uniqueId}`, cron, async function () {
          if (!isEmpty(id) && !isEmpty(fieldChange)) {
            await UPDATE_ACTION_HANDLER({
              currThis,
              currModel,
              orgid,
              moduleName,
              id,
              fieldChange,
            })
          }
        })
      }
    } else if (type === "DURATION") {
      let { term, count } = scheduleDetails || {}
      cron = getDateAfterCount({ term, count })
      job = nodeScheduler.scheduleJob(`${uniqueId}`, cron, async function () {
        if (!isEmpty(id) && !isEmpty(fieldChange)) {
          await UPDATE_ACTION_HANDLER({
            currThis,
            currModel,
            orgid,
            moduleName,
            id,
            fieldChange,
          })
        }
      })
    }

    // create a job record
    let jobData = {
      id: `${uniqueId}`,
      job: { ...job, pendingInvocations: null },
      moduleName: moduleName,
      executionDate: `${cron}`,
    }
    let { name, schema } = OTHER_MODULES["jobs"] || {}
    let jobsModel = getModel(orgid, name, schema)
    await jobsModel.create(jobData, (err) => {
      if (err) {
        console.log(err)
      }
    })

    // create cancellation workflow
    let { cancelWorkflow } = action || {}
    if (!isEmpty(cancelWorkflow)) {
      let { name: workflowName, schema: workflowSchema } =
        OTHER_MODULES["workflows"] || {}
      let workflowModel = getModel(orgid, workflowName, workflowSchema)

      let workflowId = getId()
      let workflowData = {
        name: `Schedule Cancelation ${workflowId}`,
        id: workflowId,
        ...cancelWorkflow,
        moduleName,
        actions: [
          {
            actionType: 5,
            actionDetails: {
              jobId: `${uniqueId}`,
              workflowId,
              recordId: id,
            },
          },
        ],
        type: "SCHEDULES_CANCEL",
      }

      await workflowModel.create(workflowData, (err) => {
        if (err) {
          console.log(err)
        }
      })
    }
  },
  5: async ({ action, orgid, recordContext }) => {
    let { id } = recordContext || {}
    let { actionDetails } = action
    let { jobId, recordId, workflowId } = actionDetails
    if (id === recordId) {
      let currJob = nodeScheduler.scheduledJobs[jobId]
      if (!isEmpty(currJob)) {
        currJob.cancel()

        // delete the job record
        let { name, schema } = OTHER_MODULES["jobs"] || {}
        let jobsModel = getModel(orgid, name, schema)
        await jobsModel.deleteMany({ id: { $in: [jobId] } })

        //delete the cancel schedule workflow
        let { name: workflowName, schema: workflowSchema } =
          OTHER_MODULES["workflows"] || {}
        let workflowModel = getModel(orgid, workflowName, workflowSchema)
        await workflowModel.deleteMany({ id: { $in: workflowId } })
      }
    }
  },
}

export default ACTIONS_HASH
