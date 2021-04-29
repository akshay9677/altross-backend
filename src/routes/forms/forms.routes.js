import express from "express"
import Forms from "../../controller/forms/forms.controller"

const forms = new Forms()

const router = express.Router()

router
  .route("/modules/list/forms")
  .post((...args) => forms.getModuleList(...args))
router
  .route("/modules/record/forms")
  .post((...args) => forms.getModuleRecord(...args))
router
  .route("/modules/fields/forms")
  .post((...args) => forms.getModuleFields(...args))
router
  .route("/modules/create/forms")
  .post((...args) => forms.createRecord(...args))
router
  .route("/modules/update/forms")
  .post((...args) => forms.updateRecord(...args))
router
  .route("/modules/delete/forms")
  .post((...args) => forms.deleteRecord(...args))

export default router
