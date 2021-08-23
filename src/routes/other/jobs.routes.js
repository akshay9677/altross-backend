import express from "express"
import Jobs from "../../controller/other/jobs.controller"

const jobs = new Jobs()

const router = express.Router()

router.route("/list/jobs").post((...args) => jobs.getModuleList(...args))

export default router
