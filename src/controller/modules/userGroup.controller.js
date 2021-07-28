import ModuleBase from "../module-base/moduleBase.controller"
import { MODULES } from "../../utils/moduleSchemas"
import { errorResponse } from "../../utils/responsehandler"
import { getModel } from "../getModel"
import dlv from "dlv"

const LookupHash = {
  users: { ...MODULES.users, preFill: true },
  projects: { ...MODULES.projects },
  featureGroup: { ...MODULES.featureGroup, preFill: true },
}

class UserGroup extends ModuleBase {
  constructor() {
    super({
      model: MODULES["userGroup"].schema,
      modelName: MODULES["userGroup"].name,
      lookupHash: LookupHash,
      moduleName: MODULES["userGroup"].name,
    })
  }
  async updateRecord(req, res) {
    try {
      let { orgid } = req.headers
      let currModel = this.getCurrDBModel(orgid)
      let param = req.body
      let { id, data } = param

      let oldRecord = await currModel.findOne({ id })
      await this.removeLookupRecords(
        oldRecord,
        data,
        currModel,
        orgid,
        this.moduleName
      )

      let record = await this.updateHandler({
        orgid,
        currModel,
        param: { condition: { id }, data },
        moduleName: this.moduleName,
        executeMiddleWare: !this.hideWorkflow,
      })

      if (data.featureGroup) {
        this.updateFeatureForUsers(req, record)
      }

      let actualRecord = { ...record._doc, ...data }
      await this.createLookupRecords(
        actualRecord,
        currModel,
        orgid,
        this.moduleName
      )
      return res.status(200).json({
        data: actualRecord,
        error: null,
      })
    } catch (error) {
      return res.status(200).json(errorResponse(error))
    }
  }
  async updateFeatureForUsers(req, userGroupRecord) {
    let { orgid } = req.headers
    let param = req.body
    let featureGroupId = dlv(param, "data.featureGroup.0")

    let { name: featureGroupName, schema: featureGroupSchema } =
      MODULES["featureGroup"] || {}
    let featureGroupModel = getModel(
      orgid,
      featureGroupName,
      featureGroupSchema
    )
    let currFeatureGroup = await featureGroupModel.findOne({
      id: featureGroupId,
    })
    let features = dlv(currFeatureGroup, "features")
    let users = dlv(userGroupRecord, "users")

    let { name: usersName, schema: usersSchema } = MODULES["users"] || {}
    let usersModel = getModel(orgid, usersName, usersSchema)

    let params = {
      features: [],
      featureGroup: [],
    }

    if (features) params["features"] = features
    if (featureGroupId) params["featureGroup"] = featureGroupId

    users.forEach(async (user) => {
      let oldRecord = await usersModel.findOne({ id: user })
      await this.removeLookupRecords(
        oldRecord,
        params,
        usersModel,
        orgid,
        usersName
      )

      let record = await this.updateHandler({
        orgid,
        currModel: usersModel,
        param: {
          condition: { id: user },
          data: params,
        },
        moduleName: usersName,
        executeMiddleWare: false,
      })
      await this.createLookupRecords(record, usersModel, orgid, usersName)
    })
  }
}

export default UserGroup
