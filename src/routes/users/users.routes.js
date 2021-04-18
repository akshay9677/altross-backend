import express from "express"
import Users from "../../controller/users/Users.controller"

const users = new Users()

const router = express.Router()

router
  .route("/modules/list/users")
  .post((...args) => users.getModuleList(...args))
router
  .route("/modules/record/users")
  .post((...args) => users.getModuleRecord(...args))
router
  .route("/modules/fields/users")
  .post((...args) => users.getModuleFields(...args))
router
  .route("/modules/create/users")
  .post((...args) => users.createRecord(...args))
router
  .route("/modules/update/users")
  .post((...args) => users.updateRecord(...args))
router
  .route("/modules/delete/users")
  .post((...args) => users.deleteRecord(...args))

// router
//   .route("/modules/associatesub/users")
//   .post((...args) => users.associateSubscription(...args))

export default router
