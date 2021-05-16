import express from "express"
import { pageFactory } from "../../controller/pages/pageFactory"

const router = express.Router()

router.route("/modules/pages").post((...args) => pageFactory(...args))

export default router
