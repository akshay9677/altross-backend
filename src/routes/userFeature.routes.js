import express from "express"
import UserFeature from "../controller/userFeature.controller"

const userFeature = new UserFeature()

const router = express.Router()

router
  .route("/modules/list/userFeature")
  .post((...args) => userFeature.getModuleList(...args))
router
  .route("/modules/record/userFeature")
  .post((...args) => userFeature.getModuleRecord(...args))
router
  .route("/modules/isactive/userFeature")
  .post((...args) => userFeature.isActive(...args))

export default router
