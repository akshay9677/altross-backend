import { OTHER_MODULES } from "./moduleSchemas"
import { getModel } from "../controller/getModel"
import nodeSchedule from "node-schedule"

exports.cancelJob = async ({ orgid, name }) => {
  try {
    let { name: moduleName, schema } = OTHER_MODULES["jobs"] || {}
    let jobsModel = getModel(orgid, moduleName, schema)
    await jobsModel.deleteOne({ name })
    let currJob = nodeSchedule.scheduledJobs[name]

    if (currJob) currJob.cancel()
  } catch (e) {
    console.log(e)
  }
}

exports.getDateAfterCount = ({ term, count }) => {
  let date = new Date()
  if (term === "YEAR") {
    return date.setFullYear(date.getFullYear() + count)
  } else if (term === "MONTH") {
    return date.setMonth(date.getMonth() + count)
  } else if (term === "DAY") {
    return new Date(date.setTime(date.getTime() + count * 24 * 60 * 60 * 1000))
  } else if (term === "MINUTES") {
    return new Date(date.getTime() + count * 60000)
  }
}
