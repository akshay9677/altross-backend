import express from "express"
import Workflows from "../../controller/workflows/workflow.controller"

const workflows = new Workflows()

const router = express.Router()

router
  .route("/modules/list/workflows")
  .post((...args) => workflows.getModuleList(...args))
router
  .route("/modules/create/workflows")
  .post((...args) => workflows.createRecord(...args))
router
  .route("/modules/update/workflows")
  .post((...args) => workflows.updateRecord(...args))
router
  .route("/modules/delete/workflows")
  .post((...args) => workflows.deleteRecord(...args))

export default router
