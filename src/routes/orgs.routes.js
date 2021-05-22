import express from "express"
import Orgs from "../controller/org.controller"

const orgs = new Orgs()

const router = express.Router()

router
  .route("/modules/list/orgs")
  .post((...args) => orgs.getModuleList(...args))
router
  .route("/modules/record/orgs")
  .post((...args) => orgs.getModuleRecord(...args))
router
  .route("/modules/fields/orgs")
  .post((...args) => orgs.getModuleFields(...args))
router
  .route("/modules/create/orgs")
  .post((...args) => orgs.createRecord(...args))
router
  .route("/modules/update/orgs")
  .post((...args) => orgs.updateRecord(...args))
router
  .route("/modules/delete/orgs")
  .post((...args) => orgs.deleteRecord(...args))

export default router
