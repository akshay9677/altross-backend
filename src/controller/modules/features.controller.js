import ModuleBase from "../module-base/moduleBase.controller"
import { MODULES } from "../../utils/moduleSchemas"

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
}

export default Features
