import express from "express"

const app = express()

import subscriptions from "./routes/subscriptions/subscriptions.routes"
import users from "./routes/users/users.routes"

app.use("/v1", users)
app.use("/v1", subscriptions)

export default app
