import AssociationModuleBase from "../module-base/associateModule.controller"
import { MODULES } from "../../utils/moduleSchemas"
import { isEmpty } from "../../utils/validation"
import { getModel } from "../getModel"
import { errorResponse } from "../../utils/responsehandler"

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
        let userRecord = await usersModel.findOneAndUpdate(
          { userId: id },
          { featureGroup: featureGroupId }
        )
        // update the user id and get the current feature group record
        let currFeatureGroup = await featureGroupModel.findOneAndUpdate(
          {
            id: featureGroupId,
          },
          { users: userRecord.id }
        )
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
        records = this.filterForGroup(records, featureGroupId)
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

        records = records.map((currRecord) => {
          let { conditions, conditionMatcher } = currRecord

          conditions = conditions.filter((condition, condIndex) => {
            let { featureGroup } = condition
            if (!isEmpty(featureGroup)) {
              if (condIndex - 1 > 0 || condIndex - 1 === 0) {
                conditionMatcher.splice(condIndex - 1, 1)
              } else {
                conditionMatcher.splice(condIndex, 1)
              }
            }
            return isEmpty(featureGroup)
          })

          return { ...currRecord, conditions, conditionMatcher }
        })
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
  filterForGroup(records, currGroupId) {
    return records.map((record) => {
      let { conditions, conditionMatcher } = record || {}
      if (!isEmpty(conditions)) {
        conditions = conditions.filter((condition, condIndex) => {
          let { featureGroup } = condition
          if (isEmpty(featureGroup)) {
            return true
          } else if (featureGroup === currGroupId) {
            return true
          } else {
            if (condIndex - 1 > 0 || condIndex - 1 === 0) {
              conditionMatcher.splice(condIndex - 1, 1)
            } else {
              conditionMatcher.splice(condIndex, 1)
            }
            return false
          }
        })
        return { ...record, conditions, conditionMatcher }
      } else {
        return record
      }
    })
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
        await usersModel.findOneAndUpdate(
          { userId: userId },
          { $set: { featureGroup: [] } }
        )
        // update the user id and get the current feature group record
        let currFeatureGroup = await featureGroupModel.findOneAndUpdate(
          {
            id: featureGroupId,
          },
          { $set: { users: [] } }
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
}

export default Users
