import jwt from "jsonwebtoken"
import { isEmpty } from "../utils/validation"
import { errorResponse } from "../utils/responsehandler"
import connections from "./connections"
import User from "../model/auth/LoginUser.model"
import { AuthurizationError } from "../utils/errors"

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    let token
    if (authHeader) {
      token = authHeader.split(" ")[1]
    } else {
      throw new AuthurizationError("No Auth Header")
    }
    if (isEmpty(token)) {
      throw new AuthurizationError("Unauthorized user")
    }

    let orgId = req.headers["orgid"]
    const user = await User.find({ token: token })
    if (!isEmpty(user) && parseInt(user[0].orgId) !== parseInt(orgId)) {
      throw new AuthurizationError("Unauthorized org")
    } else if (isEmpty(user)) {
      throw new AuthurizationError("Invalid Token")
    }

    jwt.verify(token, process.env.ACCESS_TOKEN, async (err) => {
      if (err) {
        return res
          .status(500)
          .json(errorResponse(new AuthurizationError("Token mismatch")))
      }
      let conn = connections.getConnection(orgId)
      if (isEmpty(conn)) {
        await connections.createConnection(orgId)
      }
      next()
    })
  } catch (error) {
    return res
      .status(error.status || 500)
      .json(errorResponse(error || new Error("Error Occured")))
  }
}

export default authenticateToken
