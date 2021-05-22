import express from "express"
import Projects from "../controller/projects.controller"

const projects = new Projects()

const router = express.Router()

router
  .route("/modules/list/projects")
  .post((...args) => projects.getModuleList(...args))
router
  .route("/modules/record/projects")
  .post((...args) => projects.getModuleRecord(...args))
router
  .route("/modules/fields/projects")
  .post((...args) => projects.getModuleFields(...args))
router
  .route("/modules/create/projects")
  .post((...args) => projects.createRecord(...args))
router
  .route("/modules/update/projects")
  .post((...args) => projects.updateRecord(...args))
router
  .route("/modules/delete/projects")
  .post((...args) => projects.deleteRecord(...args))

export default router
