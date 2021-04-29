import express from "express"

const app = express()

import subscriptions from "./routes/subscriptions/subscriptions.routes"
import users from "./routes/users/users.routes"
import workflows from "./routes/workflows/workflow.routes"
import forms from "./routes/forms/forms.routes"
import fields from "./routes/forms/fields.routes"

app.use("/v1", workflows)
app.use("/v1", users)
app.use("/v1", subscriptions)
app.use("/v1", forms)
app.use("/v1", fields)

export default app
