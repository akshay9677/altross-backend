import express from "express"
import Notifications from "../../controller/automations/workflows/notification.controller"

const notifications = new Notifications()

const router = express.Router()

router
  .route("/modules/list/notifications")
  .post((...args) => notifications.getModuleList(...args))
router
  .route("/modules/create/notifications")
  .post((...args) => notifications.createRecord(...args))
router
  .route("/modules/update/notifications")
  .post((...args) => notifications.updateRecord(...args))
router
  .route("/modules/delete/notifications")
  .post((...args) => notifications.deleteRecord(...args))
router
  .route("/modules/seen/notifications")
  .post((...args) => notifications.seen(...args))
router
  .route("/modules/seencount/notifications")
  .post((...args) => notifications.seenCount(...args))

export default router
