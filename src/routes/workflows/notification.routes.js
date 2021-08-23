import express from "express"
import Notifications from "../../controller/automations/workflows/notification.controller"

const notifications = new Notifications()

const router = express.Router()

router
  .route("/list/notifications")
  .post((...args) => notifications.getModuleList(...args))
router
  .route("/create/notifications")
  .post((...args) => notifications.createRecord(...args))
router
  .route("/update/notifications")
  .put((...args) => notifications.updateRecord(...args))
router
  .route("/delete/notifications")
  .delete((...args) => notifications.deleteRecord(...args))
router
  .route("/seen/notifications")
  .put((...args) => notifications.seen(...args))
router
  .route("/seencount/notifications")
  .post((...args) => notifications.seenCount(...args))

export default router
