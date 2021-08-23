import express from "express"
import PermissionGroup from "../../controller/modules/permissionGroup.controller"

const permissionGroup = new PermissionGroup()

const router = express.Router()

router
  .route("/list/permissionGroup")
  .post((...args) => permissionGroup.getModuleList(...args))
router
  .route("/record/permissionGroup")
  .post((...args) => permissionGroup.getModuleRecord(...args))
router
  .route("/fields/permissionGroup")
  .post((...args) => permissionGroup.getModuleFields(...args))
router
  .route("/create/permissionGroup")
  .post((...args) => permissionGroup.createRecord(...args))
router
  .route("/update/permissionGroup")
  .put((...args) => permissionGroup.updateRecord(...args))
router
  .route("/delete/permissionGroup")
  .delete((...args) => permissionGroup.deleteRecord(...args))

export default router
