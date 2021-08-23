import express from "express"
import Workflows from "../../controller/automations/workflows/workflow.controller"

const workflows = new Workflows()

const router = express.Router()

router
  .route("/list/workflows")
  .post((...args) => workflows.getModuleList(...args))
router
  .route("/create/workflows")
  .post((...args) => workflows.createRecord(...args))
router
  .route("/update/workflows")
  .put((...args) => workflows.updateRecord(...args))
router
  .route("/delete/workflows")
  .delete((...args) => workflows.deleteRecord(...args))

export default router
