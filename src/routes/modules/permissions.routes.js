import express from "express"
import Permissions from "../../controller/modules/permissions.controller"

const permissions = new Permissions()

const router = express.Router()

router
  .route("/modules/list/permissions")
  .post((...args) => permissions.getModuleList(...args))
router
  .route("/modules/record/permissions")
  .post((...args) => permissions.getModuleRecord(...args))
router
  .route("/modules/fields/permissions")
  .post((...args) => permissions.getModuleFields(...args))
router
  .route("/modules/create/permissions")
  .post((...args) => permissions.createRecord(...args))
router
  .route("/modules/update/permissions")
  .post((...args) => permissions.updateRecord(...args))
router
  .route("/modules/delete/permissions")
  .post((...args) => permissions.deleteRecord(...args))
router
  .route("/modules/associate/permissions")
  .post((...args) => permissions.associate(...args))
router
  .route("/modules/dissociate/permissions")
  .post((...args) => permissions.dissociate(...args))

export default router
