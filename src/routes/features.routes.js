import express from "express"
import Features from "../controller/features.controller"

const features = new Features()

const router = express.Router()

router
  .route("/modules/list/features")
  .post((...args) => features.getModuleList(...args))
router
  .route("/modules/record/features")
  .post((...args) => features.getModuleRecord(...args))
router
  .route("/modules/fields/features")
  .post((...args) => features.getModuleFields(...args))
router
  .route("/modules/create/features")
  .post((...args) => features.createRecord(...args))
router
  .route("/modules/update/features")
  .post((...args) => features.updateRecord(...args))
router
  .route("/modules/delete/features")
  .post((...args) => features.deleteRecord(...args))

export default router
