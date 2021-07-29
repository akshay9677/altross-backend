import express from "express"
import UserGroup from "../../controller/modules/userGroup.controller"

const userGroup = new UserGroup()

const router = express.Router()

router
  .route("/modules/list/userGroup")
  .post((...args) => userGroup.getModuleList(...args))
router
  .route("/modules/record/userGroup")
  .post((...args) => userGroup.getModuleRecord(...args))
router
  .route("/modules/fields/userGroup")
  .post((...args) => userGroup.getModuleFields(...args))
router
  .route("/modules/create/userGroup")
  .post((...args) => userGroup.createRecord(...args))
router
  .route("/modules/update/userGroup")
  .post((...args) => userGroup.updateRecord(...args))
router
  .route("/modules/delete/userGroup")
  .post((...args) => userGroup.deleteRecord(...args))

export default router
