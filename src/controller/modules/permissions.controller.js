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

class Permissions extends ModuleBase {
  constructor() {
    super({
      model: MODULES["permissions"].schema,
      modelName: MODULES["permissions"].name,
      lookupHash: LookupHash,
      moduleName: MODULES["permissions"].name,
    })
  }
  getFieldForId(param) {
    let { name, permissionId } = param
    return name + permissionId
  }
  async afterCreateHook({ data, orgid }) {
    if (!isEmpty(data.featureGroup) && !isEmpty(data.id)) {
      let { featureGroup } = data
      let users = []
      for (let featureGroupId of featureGroup) {
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

        let currUsers = dlv(featureGroupRecord, "users")
        users = [...users, ...currUsers]
      }

      if (!isEmpty(users))
        this.updateFeaturesWithUsers({ users, permissions: [data.id], orgid })
    }
  }
  async afterUpdateHook({ data, orgid, condition }) {
    await this.afterCreateHook({ data: { ...data, ...condition }, orgid })
  }
  async updateFeaturesWithUsers({ users, permissions, orgid }) {
    let { name: featuresName, schema: featuresSchema } =
      MODULES["permissions"] || {}
    let featuresModel = getModel(orgid, featuresName, featuresSchema)
    let params = {}

    if (!isEmpty(users)) params["users"] = users

    permissions.forEach(async (permission) => {
      await this.updateHandler({
        orgid,
        currModel: featuresModel,
        param: {
          condition: { id: permission },
          data: params,
        },
        moduleName: featuresName,
        executeMiddleWare: true,
      })
    })
  }
}

export default Permissions
