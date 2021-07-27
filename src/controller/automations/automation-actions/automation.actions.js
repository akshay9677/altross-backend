import { isEmpty } from "../../../utils/validation"
import { OTHER_MODULES } from "../../../utils/moduleSchemas"
import { getModel } from "../../getModel"
import { getId } from "../../../utils/validation"
import nodeMailer from "nodemailer"

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
}

export default ACTIONS_HASH
