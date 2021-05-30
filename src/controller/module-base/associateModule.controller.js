import ModuleBase from "./moduleBase.controller"
import { getId, isEmpty } from "../../utils/validation"
import { getModel } from "../getModel"
import { errorResponse } from "../../utils/responsehandler"
import { MODULES } from "../../utils/moduleSchemas"

class AssociationModuleBase extends ModuleBase {
  constructor(props) {
    let { model, modelName, lookupHash, moduleName, associationHash } = props
    super({ model, modelName, lookupHash, moduleName })
    this.associationHash = associationHash
  }
  async associate(req, res) {
    try {
      let { orgid } = req.headers

      let { moduleName } = req.body
      let { associationHash } = this

      if (isEmpty(associationHash) || isEmpty(associationHash[moduleName])) {
        throw new Error("No association module found")
      }

      let { nativeField, foreignField, foreignModule, associationModule } =
        associationHash[moduleName] || {}

      let { [nativeField]: id, [foreignField]: foriegnIds } = req.body

      if (isEmpty(id)) throw new Error("Record Id is required")

      if (isEmpty(foriegnIds)) throw new Error("Association Ids are required")

      let records = await this.associateRecords(
        orgid,
        id,
        nativeField,
        foriegnIds,
        foreignModule,
        foreignField
      )

      let { name: associationModuleName } = associationModule || {}

      let { name, schema } = MODULES[associationModuleName]
      let associationModel = getModel(orgid, name, schema)

      let finalDbRecords = await associationModel.create(records)

      return res.status(200).json({
        data: finalDbRecords,
        error: null,
      })
    } catch (error) {
      return res.status(200).json(errorResponse(error))
    }
  }
  async associateRecords(
    orgid,
    nativeId,
    nativeRefId,
    foreignIds,
    foreignSchema,
    foreignRefId
  ) {
    // native is the current module whereas foreign is the lookup to which association
    // has to be created

    let { moduleName: nativeModuleName } = this || {}
    let nativeModel = this.getCurrDBModel(orgid)
    let { name: foreignModuleName, schema } = foreignSchema
    let foreignModel = getModel(orgid, foreignModuleName, schema)

    let nativeRecord = await nativeModel.findOne({ [nativeRefId]: nativeId })
    let foreignRecords = await foreignModel.find({
      [foreignRefId]: { $in: foreignIds },
    })

    return foreignRecords.map((foreignRecord) => {
      let {
        name: foreignName,
        id: foreignId,
        [foreignRefId]: foreignRef,
      } = foreignRecord || {}
      let {
        name: nativeName,
        [nativeRefId]: nativeRef,
        id: currNativeId,
      } = nativeRecord || {}
      return {
        name: nativeName,
        id: getId(nativeName + foreignName, 9999),
        status: "ACTIVE",
        [nativeModuleName]: [currNativeId],
        [foreignModuleName]: [foreignId],
        [foreignRefId]: foreignRef,
        [nativeRefId]: nativeRef,
      }
    })
  }
  async dissociate(req, res) {
    try {
      let { orgid } = req.headers
      let { moduleName } = req.body
      let { associationHash } = this

      let { nativeField, foreignField, associationModule } =
        associationHash[moduleName] || {}

      let { [nativeField]: id, [foreignField]: foriegnIds } = req.body

      if (isEmpty(id)) throw new Error("Record Id is required")

      if (isEmpty(foriegnIds)) throw new Error("Association Ids are required")

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

export default AssociationModuleBase
