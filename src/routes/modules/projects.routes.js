import express from "express"
import Projects from "../../controller/modules/projects.controller"

const projects = new Projects()

const router = express.Router()

router
  .route("/list/projects")
  .post((...args) => projects.getModuleList(...args))
router
  .route("/record/projects")
  .post((...args) => projects.getModuleRecord(...args))
router
  .route("/fields/projects")
  .post((...args) => projects.getModuleFields(...args))
router
  .route("/create/projects")
  .post((...args) => projects.createRecord(...args))
router
  .route("/update/projects")
  .put((...args) => projects.updateRecord(...args))
router
  .route("/delete/projects")
  .delete((...args) => projects.deleteRecord(...args))

export default router
