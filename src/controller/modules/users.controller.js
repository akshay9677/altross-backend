import ModuleBase from "../module-base/moduleBase.controller"
import { MODULES } from "../../utils/moduleSchemas"
import { isEmpty } from "../../utils/validation"
import { errorResponse } from "../../utils/responsehandler"
import dlv from "dlv"
import { getModel } from "../getModel"
import { OPERATOR_HASH } from "../automations/workflows/workflow.execution"

const LookupHash = {
  projects: { ...MODULES.projects },
  permissionGroup: { ...MODULES.permissionGroup, preFill: true },
  userGroup: { ...MODULES.userGroup, preFill: true },
  permissions: { ...MODULES.permissions, preFill: true },
}

class Users extends ModuleBase {
  constructor() {
    super({
      model: MODULES["users"].schema,
      modelName: MODULES["users"].name,
      lookupHash: LookupHash,
      moduleName: MODULES["users"].name,
    })
  }
  // only one user group and permission group
  beforeCreateHook({ data }) {
    if (!isEmpty(data.permissionGroup)) {
      let { permissionGroup } = data || {}
      if (permissionGroup.length > 1)
        throw new Error("A user can have only one permission group")
    }
    if (!isEmpty(data.userGroup)) {
      let { userGroup } = data || {}
      if (userGroup.length > 1)
        throw new Error("A user can have only one user group")
    }
  }
  // only one user group and permission group
  async beforeUpdateHook({ data, condition, orgid }) {
    let currModel = this.getCurrDBModel(orgid)
    let currUserGroup = await currModel.findOne(condition)
    if (
      !isEmpty(data.permissionGroup) &&
      Array.isArray(data.permissionGroup) &&
      data.permissionGroup.length > 1
    ) {
      throw new Error("A user can have only one permission group")
    } else if (
      !Array.isArray(data.permissionGroup) &&
      !isEmpty(currUserGroup.permissionGroup) &&
      !isEmpty(data.permissionGroup)
    ) {
      throw new Error("A user can have only one permission group")
    }

    if (
      !isEmpty(data.userGroup) &&
      Array.isArray(data.userGroup) &&
      data.userGroup.length > 1
    ) {
      throw new Error("A user can have only one user group")
    } else if (
      !Array.isArray(data.userGroup) &&
      !isEmpty(currUserGroup.userGroup) &&
      !isEmpty(data.userGroup)
    ) {
      throw new Error("A user can have only one user group")
    }
  }
  async afterCreateHook({ data, orgid }) {
    let permissionGroupId
    if (!isEmpty(data.userGroup)) {
      let { name: userGroupName, schema: userGroupSchema } =
        MODULES["userGroup"] || {}
      let userGroupModel = getModel(orgid, userGroupName, userGroupSchema)
      let userGroupRecord = await userGroupModel.findOne({
        id: dlv(data, "userGroup.0"),
      })

      let currPermissionGroup = dlv(userGroupRecord, "permissionGroup.0")
      let { id } = data
      let adminUsers = dlv(userGroupRecord, "adminUsers")

      if (adminUsers.includes(id)) permissionGroupId = currPermissionGroup
    }

    if (isEmpty(permissionGroupId) && !isEmpty(data.permissionGroup)) {
      permissionGroupId = dlv(data, "permissionGroup.0")
    }

    if (!isEmpty(permissionGroupId) && !isEmpty(data.id)) {
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

      let permissions = dlv(permissionGroupRecord, "permissions")

      if (!isEmpty(permissions) && !isEmpty(data.id))
        this.updateUsersWithPermissions({
          users: [data.id],
          permissions,
          permissionGroup: permissionGroupId,
          orgid,
        })
    }
  }
  async afterUpdateHook({ data, orgid, condition }) {
    await this.afterCreateHook({ data: { ...data, ...condition }, orgid })
  }
  async updateUsersWithPermissions({
    users,
    permissions,
    permissionGroup,
    orgid,
  }) {
    let { name: usersName, schema: usersSchema } = MODULES["users"] || {}
    let usersModel = getModel(orgid, usersName, usersSchema)
    let params = {}

    if (!isEmpty(permissions)) params["permissions"] = permissions
    if (!isEmpty(permissionGroup)) params["permissionGroup"] = [permissionGroup]

    users.forEach(async (user) => {
      await this.updateHandler({
        orgid,
        currModel: usersModel,
        param: {
          condition: { id: user },
          data: params,
        },
        moduleName: usersName,
        executeMiddleWare: true,
      })
    })
  }
  async isActive(req, res) {
    try {
      let { orgid } = req.headers
      let { userId, permissionId, resource, actor } = req.body

      if (isEmpty(userId)) throw new Error("User Id is required")
      if (isEmpty(permissionId)) throw new Error("Permission Id is required")

      let currStatus
      // get permission group from user
      let currModel = this.getCurrDBModel(orgid)
      let userRecord = await currModel.findOne({ userId })
      let currPermissionGroup = dlv(userRecord, "permissionGroup.0", null)
      // get conditions from permission record
      let permissionsModel = getModel(
        orgid,
        MODULES["permissions"].name,
        MODULES["permissions"].schema
      )
      let permissionRecord = await permissionsModel.findOne({ permissionId })

      let {
        conditions,
        conditionMatcher,
        users: permissionUsers,
      } = permissionRecord
      let status

      if (this.userPermissionCheck(userRecord, permissionRecord)) {
        currStatus = "ACTIVE"
      } else {
        currStatus = "EXPIRED"
      }

      if (
        !isEmpty(conditions) &&
        !isEmpty(conditionMatcher) &&
        !isEmpty(resource)
      ) {
        let conditionsSatisfiedArray = conditions.map((condition) => {
          let { key, value, operator, dataType, permissionGroup, actorKey } =
            condition
          let actualValue = resource[key]
          if (
            isEmpty(permissionGroup) ||
            (!isEmpty(permissionGroup) &&
              permissionGroup === currPermissionGroup)
          ) {
            if (
              !isEmpty(OPERATOR_HASH[dataType]) &&
              !isEmpty((OPERATOR_HASH[dataType] || {})[operator])
            ) {
              let selectedOperator = OPERATOR_HASH[dataType][operator]
              if (!isEmpty(actor) && !isEmpty(actorKey)) {
                let val = actor[actorKey]
                return selectedOperator.action(actualValue, val)
              } else {
                return selectedOperator.action(actualValue, value)
              }
            }
          } else {
            let { id: currUserId } = userRecord

            if (permissionUsers.includes(currUserId)) return true
            else return false
          }
        })

        for (let i = 0; i < conditionMatcher.length; i++) {
          let charAtIndex = conditionMatcher.charAt(i)
          if (this.isNumeric(charAtIndex)) {
            let actualVal =
              conditionsSatisfiedArray[conditionMatcher.charAt(i) - 1]

            if (!isEmpty(actualVal)) {
              conditionMatcher = this.replaceChar(
                conditionMatcher,
                `${actualVal}`,
                i
              )
            } else {
              conditionMatcher = this.replaceChar(
                conditionMatcher,
                `${false}`,
                i
              )
            }
          }
        }

        conditionMatcher = conditionMatcher.replace(/and/g, "&&")
        conditionMatcher = conditionMatcher.replace(/or/g, "||")

        let finalStatus = eval(conditionMatcher)

        if (finalStatus) {
          status = "ACTIVE"
        } else {
          status = "EXPIRED"
        }
      } else {
        status = currStatus
      }

      return res.status(200).json({
        data: { status },
        error: null,
      })
    } catch (error) {
      return res.status(200).json(errorResponse(error))
    }
  }
  userPermissionCheck(user, permission) {
    let { permissions } = user || {}
    let { id } = permission
    return (permissions || []).includes(id)
  }
  isNumeric(str) {
    if (typeof str != "string") return false
    return !isNaN(str) && !isNaN(parseFloat(str))
  }

  replaceChar(origString, replaceChar, index) {
    let firstPart = origString.substr(0, index)
    let lastPart = origString.substr(index + 1)

    let newString = firstPart + replaceChar + lastPart
    return newString
  }
}

export default Users
