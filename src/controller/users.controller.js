import AssociationModuleBase from "./module-base/associateModule.controller"
import { MODULES } from "../utils/moduleSchemas"

const LookupHash = {
  orgs: { ...MODULES.orgs, preFill: true },
  projects: { ...MODULES.projects },
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
  getFieldForId(param) {
    let { name, userID } = param
    return name + userID
  }
}

export default Users
