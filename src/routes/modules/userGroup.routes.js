import express from "express"
import UserGroup from "../../controller/modules/userGroup.controller"

const userGroup = new UserGroup()

const router = express.Router()

router
  .route("/list/userGroup")
  .post((...args) => userGroup.getModuleList(...args))
router
  .route("/record/userGroup")
  .post((...args) => userGroup.getModuleRecord(...args))
router
  .route("/fields/userGroup")
  .post((...args) => userGroup.getModuleFields(...args))
router
  .route("/create/userGroup")
  .post((...args) => userGroup.createRecord(...args))
router
  .route("/update/userGroup")
  .put((...args) => userGroup.updateRecord(...args))
router
  .route("/delete/userGroup")
  .delete((...args) => userGroup.deleteRecord(...args))

export default router
