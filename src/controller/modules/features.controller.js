import AssociationModuleBase from "../module-base/associateModule.controller"
import { MODULES, OTHER_MODULES } from "../../utils/moduleSchemas"
import { isEmpty } from "../../utils/validation"
import { getModel } from "../getModel"
import dlv from "dlv"
import nodeSchedule from "node-schedule"

const LookupHash = {
  projects: { ...MODULES.projects },
  featureGroup: { ...MODULES.featureGroup, preFill: true },
}

const AssociationHash = {
  users: {
    nativeField: "featureId",
    foreignField: "userId",
    foreignModule: MODULES["users"],
    associationModule: MODULES["userFeature"],
  },
}

class Features extends AssociationModuleBase {
  constructor() {
    super({
      model: MODULES["features"].schema,
      modelName: MODULES["features"].name,
      lookupHash: LookupHash,
      moduleName: MODULES["features"].name,
      associationHash: AssociationHash,
    })
  }
  getFieldForId(param) {
    let { name, featureId } = param
    return name + featureId
  }
  async getExtraProps(records) {
    // association hash
    let { associationHash, updateHandler } = this
    let { associationModule } = associationHash["users"] || {}
    let { name: associationModuleName } = associationModule || {}
    let { name, schema } = MODULES[associationModuleName]
    let orgid = dlv(records, "orgid")
    let associationModel = getModel(orgid, name, schema)

    // feature & user data
    let features = dlv(records, "native.data")
    let user = dlv(records, "foreign.data")
    let currUserFeatureGroup = dlv(user, "featureGroup.0")

    if (
      !isEmpty(currUserFeatureGroup) &&
      !isEmpty(user) &&
      !isEmpty(features)
    ) {
      let { schedules } = features || {}
      schedules = schedules.filter((schedule) => {
        let { featureGroup } = schedule || {}
        if (!isEmpty(featureGroup) && featureGroup === currUserFeatureGroup) {
          return true
        } else if (isEmpty(featureGroup)) {
          return true
        } else {
          return false
        }
      })
      let { term } = schedules[0] || {}
      let job
      let date = new Date()
      let { featureId } = features || {}
      let { userId } = user || {}
      let uniqueName = `${userId}${featureId}`
      if (term === "ANUALY") {
        date.setFullYear(date.getFullYear() + 1)
        job = nodeSchedule.scheduleJob(uniqueName, date, async function () {
          let param = {
            condition: { featureId, userId },
            data: { status: "EXPIRED" },
          }
          updateHandler({
            orgid,
            currModel: associationModel,
            param,
            moduleName: "userFeature",
            executeMiddleWare: true,
          })
        })
      } else if (term === "MONTHLY") {
        date.setMonth(date.getMonth() + 1)
        job = nodeSchedule.scheduleJob(uniqueName, date, async function () {
          let param = {
            condition: { featureId, userId },
            data: { status: "EXPIRED" },
          }
          updateHandler({
            orgid,
            currModel: associationModel,
            param,
            moduleName: "userFeature",
            executeMiddleWare: true,
          })
        })
      }
      if (!isEmpty(job) && !isEmpty(job.pendingInvocations))
        delete job.pendingInvocations
      let jobData = {
        name: uniqueName,
        job,
        moduleName: "userFeature",
        config: { featureId, userId },
        pattern: `${date}`,
      }
      let { name, schema } = OTHER_MODULES["jobs"] || {}
      let jobsModel = getModel(orgid, name, schema)
      await jobsModel.create(jobData, (err) => {
        if (err) {
          console.log(err)
        }
      })
    }
  }
}

export default Features
