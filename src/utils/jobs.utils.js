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
