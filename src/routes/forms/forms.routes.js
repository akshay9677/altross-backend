import express from "express"
import Forms from "../../controller/forms/forms.controller"

const forms = new Forms()

const router = express.Router()

router.route("/list/forms").post((...args) => forms.getModuleList(...args))
router.route("/record/forms").post((...args) => forms.getModuleRecord(...args))
router.route("/fields/forms").post((...args) => forms.getModuleFields(...args))
router.route("/create/forms").post((...args) => forms.createRecord(...args))
router.route("/update/forms").post((...args) => forms.updateRecord(...args))
router.route("/delete/forms").post((...args) => forms.deleteRecord(...args))

export default router
