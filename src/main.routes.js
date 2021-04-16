import express from "express"

const app = express()

import subscriptions from "./routes/subscriptions/subscriptions.routes"

app.use("/v1", subscriptions)

module.exports = app
