import ModuleBase from "../module-base/moduleBase.controller"
import { MODULES } from "../../utils/moduleSchemas"
import { isEmpty } from "../../utils/validation"
import { getModel } from "../getModel"
import dlv from "dlv"

const LookupHash = {
  projects: { ...MODULES.projects },
  featureGroup: { ...MODULES.featureGroup, preFill: true },
  users: { ...MODULES.users, preFill: true },
}

class Features extends ModuleBase {
  constructor() {
    super({
      model: MODULES["features"].schema,
      modelName: MODULES["features"].name,
      lookupHash: LookupHash,
      moduleName: MODULES["features"].name,
    })
  }
  getFieldForId(param) {
    let { name, featureId } = param
    return name + featureId
  }
  async afterCreateHook({ data, orgid }) {
    if (!isEmpty(data.featureGroup) && !isEmpty(data.id)) {
      let featureGroupId = dlv(data, "featureGroup.0")
      let { name: featureGroupName, schema: featureGroupSchema } =
        MODULES["featureGroup"] || {}
      let featureGroupModel = getModel(
        orgid,
        featureGroupName,
        featureGroupSchema
      )
      let featureGroupRecord = await featureGroupModel.findOne({
        id: featureGroupId,
      })

      let users = dlv(featureGroupRecord, "users")

      if (!isEmpty(users))
        this.updateFeaturesWithUsers({ users, features: [data.id], orgid })
    }
  }
  async afterUpdateHook({ data, orgid, condition }) {
    await this.afterCreateHook({ data: { ...data, ...condition }, orgid })
  }
  async updateFeaturesWithUsers({ users, features, orgid }) {
    let { name: featuresName, schema: featuresSchema } =
      MODULES["features"] || {}
    let featuresModel = getModel(orgid, featuresName, featuresSchema)
    let params = {}

    if (!isEmpty(users)) params["users"] = users

    features.forEach(async (feature) => {
      await this.updateHandler({
        orgid,
        currModel: featuresModel,
        param: {
          condition: { id: feature },
          data: params,
        },
        moduleName: featuresName,
        executeMiddleWare: true,
      })
    })
  }
}

export default Features
