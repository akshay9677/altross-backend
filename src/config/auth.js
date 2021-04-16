import jwt from "jsonwebtoken"
import { isEmpty } from "../utils/validation"
import { errorResponse } from "../utils/responsehandler"
import connections from "./connections"
import User from "../model/auth/LoginUser.model"

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader.split(" ")[1]
    if (isEmpty(token)) {
      throw new Error("Unauthorized user")
    }

    let orgId = req.headers["orgid"]
    const user = await User.find({ token: token })
    if (!isEmpty(user) && parseInt(user[0].orgId) !== parseInt(orgId)) {
      throw new Error("Unauthorized org")
    } else if (isEmpty(user)) {
      throw new Error("Invalid Token")
    }

    jwt.verify(token, process.env.ACCESS_TOKEN, async (err) => {
      if (err) {
        return res.status(500).json(errorResponse(new Error("Token mismatch")))
      }
      let conn = connections.getConnection(orgId)
      if (isEmpty(conn)) {
        await connections.createConnection(orgId)
      }
      next()
    })
  } catch (error) {
    return res
      .status(500)
      .json(errorResponse(error || new Error("Error Occured")))
  }
}

export default authenticateToken
