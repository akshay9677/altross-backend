import express from "express"
import PermissionGroup from "../../controller/modules/permissionGroup.controller"

const permissionGroup = new PermissionGroup()

const router = express.Router()

router
  .route("/modules/list/permissionGroup")
  .post((...args) => permissionGroup.getModuleList(...args))
router
  .route("/modules/record/permissionGroup")
  .post((...args) => permissionGroup.getModuleRecord(...args))
router
  .route("/modules/fields/permissionGroup")
  .post((...args) => permissionGroup.getModuleFields(...args))
router
  .route("/modules/create/permissionGroup")
  .post((...args) => permissionGroup.createRecord(...args))
router
  .route("/modules/update/permissionGroup")
  .post((...args) => permissionGroup.updateRecord(...args))
router
  .route("/modules/delete/permissionGroup")
  .post((...args) => permissionGroup.deleteRecord(...args))

export default router
