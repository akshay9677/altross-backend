import express from "express"
import Permissions from "../../controller/modules/permissions.controller"

const permissions = new Permissions()

const router = express.Router()

router
  .route("/list/permissions")
  .post((...args) => permissions.getModuleList(...args))
router
  .route("/record/permissions")
  .post((...args) => permissions.getModuleRecord(...args))
router
  .route("/fields/permissions")
  .post((...args) => permissions.getModuleFields(...args))
router
  .route("/create/permissions")
  .post((...args) => permissions.createRecord(...args))
router
  .route("/update/permissions")
  .put((...args) => permissions.updateRecord(...args))
router
  .route("/delete/permissions")
  .delete((...args) => permissions.deleteRecord(...args))

export default router
