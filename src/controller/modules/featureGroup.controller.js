import ModuleBase from "../module-base/moduleBase.controller"
import { MODULES } from "../../utils/moduleSchemas"

const LookupHash = {
  users: { ...MODULES.users, preFill: true },
  features: { ...MODULES.features, preFill: true },
  projects: { ...MODULES.projects },
  userGroup: { ...MODULES.userGroup, preFill: true },
}

class FeatureGroup extends ModuleBase {
  constructor() {
    super({
      model: MODULES["featureGroup"].schema,
      modelName: MODULES["featureGroup"].name,
      lookupHash: LookupHash,
      moduleName: MODULES["featureGroup"].name,
    })
  }
}

export default FeatureGroup
