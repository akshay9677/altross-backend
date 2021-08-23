import express from "express"
import Users from "../../controller/modules/users.controller"

const users = new Users()

const router = express.Router()

router.route("/list/users").post((...args) => users.getModuleList(...args))
router.route("/record/users").post((...args) => users.getModuleRecord(...args))
router.route("/fields/users").post((...args) => users.getModuleFields(...args))
router.route("/create/users").post((...args) => users.createRecord(...args))
router.route("/update/users").put((...args) => users.updateRecord(...args))
router.route("/delete/users").delete((...args) => users.deleteRecord(...args))
router.route("/hasPermission/users").post((...args) => users.isActive(...args))

export default router
