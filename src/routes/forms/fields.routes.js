import express from "express"
import Fields from "../../controller/forms/fields.controller"

const fields = new Fields()

const router = express.Router()

router
  .route("/modules/list/fields")
  .post((...args) => fields.getModuleList(...args))
router
  .route("/modules/record/fields")
  .post((...args) => fields.getModuleRecord(...args))
router
  .route("/modules/fields/fields")
  .post((...args) => fields.getModuleFields(...args))
router
  .route("/modules/create/fields")
  .post((...args) => fields.createRecord(...args))
router
  .route("/modules/update/fields")
  .post((...args) => fields.updateRecord(...args))
router
  .route("/modules/delete/fields")
  .post((...args) => fields.deleteRecord(...args))

export default router
