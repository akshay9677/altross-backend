import express from "express"
import { login, signup, logout, getAccount } from "../../controller/auth/login"

const router = express.Router()

router.route("/login").post(login)
router.route("/logout").post(logout)
router.route("/signup").post(signup)
router.route("/user").post(getAccount)

export default router
