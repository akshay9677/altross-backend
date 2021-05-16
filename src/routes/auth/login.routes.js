import express from "express"
import {
  login,
  signup,
  logout,
  getAccount,
  updateAccount,
} from "../../controller/auth/login"

const router = express.Router()

router.route("/login").post(login)
router.route("/logout").post(logout)
router.route("/signup").post(signup)
router.route("/user").post(getAccount)
router.route("/update/user").post(updateAccount)

export default router
