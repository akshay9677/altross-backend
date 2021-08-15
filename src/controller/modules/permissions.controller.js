import ModuleBase from "../module-base/moduleBase.controller"
import { MODULES } from "../../utils/moduleSchemas"
import { isEmpty } from "../../utils/validation"
import { getModel } from "../getModel"
import dlv from "dlv"

const LookupHash = {
  projects: { ...MODULES.projects },
  permissionGroup: { ...MODULES.permissionGroup, preFill: true },
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
    if (!isEmpty(data.permissionGroup) && !isEmpty(data.id)) {
      let { permissionGroup } = data
      let users = []
      for (let permissionGroupId of permissionGroup) {
        let { name: permissionGroupName, schema: permissionGroupSchema } =
          MODULES["permissionGroup"] || {}
        let permissionGroupModel = getModel(
          orgid,
          permissionGroupName,
          permissionGroupSchema
        )
        let permissionGroupRecord = await permissionGroupModel.findOne({
          id: permissionGroupId,
        })

        let currUsers = dlv(permissionGroupRecord, "users")
        users = [...users, ...currUsers]
      }

      if (!isEmpty(users))
        this.updatePermissionsWithUsers({
          users,
          permissions: [data.id],
          orgid,
        })
    }
  }
  async afterUpdateHook({ data, orgid, condition }) {
    await this.afterCreateHook({ data: { ...data, ...condition }, orgid })
  }

  async updatePermissionsWithUsers({ users, permissions, orgid }) {
    let { name: permissionsName, schema: permissionsSchema } =
      MODULES["permissions"] || {}
    let permissionsModel = getModel(orgid, permissionsName, permissionsSchema)
    let params = {}

    if (!isEmpty(users)) params["users"] = users

    permissions.forEach(async (permission) => {
      await this.updateHandler({
        orgid,
        currModel: permissionsModel,
        param: {
          condition: { id: permission },
          data: params,
        },
        moduleName: permissionsName,
        executeMiddleWare: true,
      })
    })
  }
}

export default Permissions
