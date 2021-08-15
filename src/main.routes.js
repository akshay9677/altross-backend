import express from "express"

const app = express()

import workflows from "./routes/workflows/workflow.routes"
import forms from "./routes/forms/forms.routes"
import fields from "./routes/forms/fields.routes"
import views from "./routes/views/views.routes"
import pages from "./routes/pages/pages.routes"
import notifications from "./routes/workflows/notification.routes"
import jobs from "./routes/other/jobs.routes"

import projects from "./routes/modules/projects.routes"
import users from "./routes/modules/users.routes"
import permissions from "./routes/modules/permissions.routes"
import userFeature from "./routes/modules/userFeature.routes"
import permissionGroup from "./routes/modules/permissionGroup.routes"
import userGroup from "./routes/modules/userGroup.routes"

import moduleMeta from "./routes/meta/modulemeta.routes"

app.use("/v1", workflows)
app.use("/v1", forms)
app.use("/v1", fields)
app.use("/v1", views)
app.use("/v1", pages)
app.use("/v1", projects)
app.use("/v1", users)
app.use("/v1", permissions)
app.use("/v1", userFeature)
app.use("/v1", permissionGroup)
app.use("/v1", userGroup)
app.use("/v1", notifications)
app.use("/v1", jobs)

app.use("/v1", moduleMeta)

export default app
