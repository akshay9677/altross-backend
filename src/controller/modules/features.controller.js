import AssociationModuleBase from "../module-base/associateModule.controller"
import { MODULES } from "../../utils/moduleSchemas"

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
}

export default Features
