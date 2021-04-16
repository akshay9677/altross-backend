import express from "express"
import Subscriptions from "../../controller/subscriptions/subscriptions.controller"

const subscriptions = new Subscriptions()

const router = express.Router()

router
  .route("/modules/list/subscriptions")
  .post((...args) => subscriptions.getModuleList(...args))
router
  .route("/modules/create/subscriptions")
  .post((...args) => subscriptions.createRecord(...args))

export default router
