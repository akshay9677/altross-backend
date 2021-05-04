import express from "express"
import Views from "../../controller/views/view.controller"

const views = new Views()

const router = express.Router()

router
  .route("/modules/list/views")
  .post((...args) => views.getModuleList(...args))
router
  .route("/modules/record/views")
  .post((...args) => views.getModuleRecord(...args))
router
  .route("/modules/create/views")
  .post((...args) => views.createRecord(...args))
router
  .route("/modules/update/views")
  .post((...args) => views.updateRecord(...args))
router
  .route("/modules/delete/views")
  .post((...args) => views.deleteRecord(...args))

export default router
