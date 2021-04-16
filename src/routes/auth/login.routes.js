import express from "express"
import { login, signup, logout } from "../../controller/auth/login"

const router = express.Router()

router.route("/login").post(login)
router.route("/logout").post(logout)
router.route("/signup").post(signup)

export default router
