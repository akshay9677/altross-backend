import express from "express"
import Fields from "../../controller/forms/fields.controller"

const fields = new Fields()

const router = express.Router()

router.route("/list/fields").post((...args) => fields.getModuleList(...args))
router
  .route("/record/fields")
  .post((...args) => fields.getModuleRecord(...args))
router
  .route("/fields/fields")
  .post((...args) => fields.getModuleFields(...args))
router.route("/create/fields").post((...args) => fields.createRecord(...args))
router.route("/update/fields").post((...args) => fields.updateRecord(...args))
router.route("/delete/fields").post((...args) => fields.deleteRecord(...args))

export default router
