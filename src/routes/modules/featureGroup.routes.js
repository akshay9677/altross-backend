import express from "express"
import FeatureGroup from "../../controller/modules/featureGroup.controller"

const featureGroup = new FeatureGroup()

const router = express.Router()

router
  .route("/modules/list/featureGroup")
  .post((...args) => featureGroup.getModuleList(...args))
router
  .route("/modules/record/featureGroup")
  .post((...args) => featureGroup.getModuleRecord(...args))
router
  .route("/modules/fields/featureGroup")
  .post((...args) => featureGroup.getModuleFields(...args))
router
  .route("/modules/create/featureGroup")
  .post((...args) => featureGroup.createRecord(...args))
router
  .route("/modules/update/featureGroup")
  .post((...args) => featureGroup.updateRecord(...args))
router
  .route("/modules/delete/featureGroup")
  .post((...args) => featureGroup.deleteRecord(...args))

export default router
