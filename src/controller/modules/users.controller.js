import AssociationModuleBase from "../module-base/associateModule.controller"
import { MODULES, OTHER_MODULES } from "../../utils/moduleSchemas"
import { isEmpty } from "../../utils/validation"
import { getModel } from "../getModel"
import { errorResponse } from "../../utils/responsehandler"
import { cancelJob } from "../../utils/jobs.utils"
import dlv from "dlv"
import nodeSchedule from "node-schedule"

const LookupHash = {
  projects: { ...MODULES.projects },
  featureGroup: { ...MODULES.featureGroup, preFill: true },
}

const AssociationHash = {
  features: {
    nativeField: "userId",
    foreignField: "featureId",
    foreignModule: MODULES["features"],
    associationModule: MODULES["userFeature"],
  },
}

class Users extends AssociationModuleBase {
  constructor() {
    super({
      model: MODULES["users"].schema,
      modelName: MODULES["users"].name,
      lookupHash: LookupHash,
      moduleName: MODULES["users"].name,
      associationHash: AssociationHash,
    })
  }
  async associate(req, res) {
    try {
      let { orgid } = req.headers

      let { moduleName } = req.body
      let { associationHash } = this
      let records

      // feature group association
      if (moduleName === MODULES["featureGroup"].name) {
        // get feature group model
        let { name: featureGroupName, schema: featureGroupSchema } =
          MODULES["featureGroup"]
        let featureGroupModel = getModel(
          orgid,
          featureGroupName,
          featureGroupSchema
        )
        let { nativeField, foreignField, foreignModule } =
          associationHash["features"] || {}
        let { [nativeField]: id, [featureGroupName]: featureGroupId } = req.body
        // update the user with this feature group as lookup
        let usersModel = this.getCurrDBModel(orgid)
        let userRecord = await this.updateHandler({
          orgid,
          currModel: usersModel,
          param: {
            condition: { userId: id },
            data: { featureGroup: featureGroupId },
          },
          moduleName: this.moduleName,
          executeMiddleWare: true,
        })

        let actualRecord = {
          ...userRecord._doc,
        }
        this.createLookupRecords(actualRecord, usersModel, orgid)
        let currFeatureGroup = await featureGroupModel.findOne({
          id: featureGroupId,
        })

        // get all features for the feature ids in the current feature group
        let { features } = currFeatureGroup
        let featuresModel = getModel(
          orgid,
          MODULES["features"].name,
          MODULES["features"].schema
        )
        let featuresList = await featuresModel.find({ id: { $in: features } })
        let foriegnIds = featuresList.map(
          (currFeature) => currFeature.featureId
        )

        // use that features and get the featureIds list and call associate record with
        // that feature ids and the user id from params

        records = await this.associateRecords(
          orgid,
          id,
          nativeField,
          foriegnIds,
          foreignModule,
          foreignField
        )
        records = records.map((record) => {
          return { ...record, featureGroup: featureGroupId }
        })
        moduleName = "features"
      } else {
        if (isEmpty(associationHash) || isEmpty(associationHash[moduleName])) {
          throw new Error("No association module found")
        }
        let { nativeField, foreignField, foreignModule } =
          associationHash[moduleName] || {}

        let { [nativeField]: id, [foreignField]: foriegnIds } = req.body

        if (isEmpty(id)) throw new Error("Record Id is required")

        if (isEmpty(foriegnIds)) throw new Error("Association Ids are required")

        records = await this.associateRecords(
          orgid,
          id,
          nativeField,
          foriegnIds,
          foreignModule,
          foreignField
        )
      }
      let { associationModule } = associationHash[moduleName] || {}
      let { name: associationModuleName } = associationModule || {}

      let { name, schema } = MODULES[associationModuleName]
      let associationModel = getModel(orgid, name, schema)

      await associationModel.create(records, (err) => {
        if (err) {
          // if record already exists
        }
      })

      return res.status(200).json({
        data: records,
        error: null,
      })
    } catch (error) {
      return res.status(200).json(errorResponse(error))
    }
  }
  async dissociate(req, res) {
    try {
      let { orgid } = req.headers
      let { moduleName } = req.body
      let { associationHash } = this
      let id, foriegnIds

      if (moduleName === MODULES["featureGroup"].name) {
        // get feature group model
        let { name: featureGroupName, schema: featureGroupSchema } =
          MODULES["featureGroup"]
        let featureGroupModel = getModel(
          orgid,
          featureGroupName,
          featureGroupSchema
        )
        let { nativeField } = associationHash["features"] || {}
        let { [nativeField]: userId, [featureGroupName]: featureGroupId } =
          req.body
        // update the user with this feature group as lookup
        let usersModel = this.getCurrDBModel(orgid)
        let userRecord = await this.updateHandler({
          orgid,
          currModel: usersModel,
          param: {
            condition: { userId: userId },
            data: { $set: { featureGroup: [] } },
          },
          moduleName: this.moduleName,
          executeMiddleWare: true,
        })
        let { id: currUserid } = userRecord._doc
        // update the user id and get the current feature group record
        let currFeatureGroup = await featureGroupModel.findOneAndUpdate(
          {
            id: featureGroupId,
          },
          { $pull: { users: currUserid } }
        )
        // get all features for the feature ids in the current feature group
        let { features } = currFeatureGroup
        let featuresModel = getModel(
          orgid,
          MODULES["features"].name,
          MODULES["features"].schema
        )
        let featuresList = await featuresModel.find({ id: { $in: features } })
        id = userId
        foriegnIds = featuresList.map((currFeature) => currFeature.featureId)
        moduleName = "features"
      } else {
        let { nativeField, foreignField } = associationHash[moduleName] || {}

        let { [nativeField]: idParam, [foreignField]: foriegnIdsParam } =
          req.body

        id = idParam
        foriegnIds = foriegnIdsParam
      }

      if (isEmpty(id)) throw new Error("Record Id is required")

      if (isEmpty(foriegnIds)) throw new Error("Association Ids are required")

      let { associationModule, nativeField, foreignField } =
        associationHash[moduleName] || {}
      let { name: associationModuleName } = associationModule || {}
      let { name, schema } = MODULES[associationModuleName]
      let associationModel = getModel(orgid, name, schema)

      foriegnIds.forEach((foreignid) => {
        let name = `${id}${foreignid}`
        cancelJob({ orgid, name })
      })
      await associationModel.deleteMany({
        [nativeField]: id,
        [foreignField]: { $in: foriegnIds },
      })
      return res.status(200).json({
        data: "Records dissociated successfully",
        error: null,
      })
    } catch (error) {
      return res.status(200).json(errorResponse(error))
    }
  }
  async getExtraProps(records) {
    // association hash
    let { associationHash, updateHandler } = this
    let { associationModule } = associationHash["features"] || {}
    let { name: associationModuleName } = associationModule || {}
    let { name, schema } = MODULES[associationModuleName]
    let orgid = dlv(records, "orgid")
    let associationModel = getModel(orgid, name, schema)

    // feature & user data
    let features = dlv(records, "foreign.data")
    let user = dlv(records, "native.data")
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
      if (!isEmpty(job) && !isEmpty(job.pendingInvocations)) {
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
            //
          }
        })
      }
    }
  }
}

export default Users
