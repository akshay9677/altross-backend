import express from "express"
import bodyParser from "body-parser"
import path from "path"
require("dotenv").config({
  path: path.resolve(__dirname + "/config/config.env"),
})
import { connectDB } from "./config/db"
import loginRoute from "./routes/auth/login.routes"
import auth from "./config/auth"

connectDB(process.env.MONGO_MAIN_DB)

const app = express()

const routes = require("./main.routes")

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use("/api/v1", loginRoute)
app.use("/api", auth, routes)

const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`Server started at ${port}`)
})
