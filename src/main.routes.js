import express from "express"

const app = express()

import workflows from "./routes/workflows/workflow.routes"
import forms from "./routes/forms/forms.routes"
import fields from "./routes/forms/fields.routes"
import views from "./routes/views/views.routes"
import pages from "./routes/pages/pages.routes"

import projects from "./routes/projects.routes"
import orgs from "./routes/orgs.routes"
import users from "./routes/users.routes"
import features from "./routes/features.routes"
import userFeature from "./routes/userFeature.routes"
import featureGroup from "./routes/featureGroup.routes"

app.use("/v1", workflows)
app.use("/v1", forms)
app.use("/v1", fields)
app.use("/v1", views)
app.use("/v1", pages)
app.use("/v1", projects)
app.use("/v1", orgs)
app.use("/v1", users)
app.use("/v1", features)
app.use("/v1", userFeature)
app.use("/v1", featureGroup)

export default app
