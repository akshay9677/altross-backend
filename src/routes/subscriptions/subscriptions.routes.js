import express from "express"
import Subscriptions from "../../controller/subscriptions/subscriptions.controller"

const subscriptions = new Subscriptions()

const router = express.Router()

router
  .route("/modules/list/subscriptions")
  .post((...args) => subscriptions.getModuleList(...args))
router
  .route("/modules/record/subscriptions")
  .post((...args) => subscriptions.getModuleRecord(...args))
router
  .route("/modules/fields/subscriptions")
  .post((...args) => subscriptions.getModuleFields(...args))
router
  .route("/modules/create/subscriptions")
  .post((...args) => subscriptions.createRecord(...args))
router
  .route("/modules/update/subscriptions")
  .post((...args) => subscriptions.updateRecord(...args))
router
  .route("/modules/delete/subscriptions")
  .post((...args) => subscriptions.deleteRecord(...args))

export default router
