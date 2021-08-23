import express from "express"
import Views from "../../controller/views/view.controller"

const views = new Views()

const router = express.Router()

router.route("/list/views").post((...args) => views.getModuleList(...args))
router.route("/record/views").post((...args) => views.getModuleRecord(...args))
router.route("/create/views").post((...args) => views.createRecord(...args))
router.route("/update/views").put((...args) => views.updateRecord(...args))
router.route("/delete/views").delete((...args) => views.deleteRecord(...args))

export default router
