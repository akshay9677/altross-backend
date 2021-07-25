import express from "express"
import { moduleList } from "../../controller/meta/module.meta"

const router = express.Router()

router.route("/modules/meta/list").post((...args) => moduleList(...args))

export default router
