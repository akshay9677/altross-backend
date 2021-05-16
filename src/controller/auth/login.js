import { errorResponse } from "../../utils/responsehandler"
import { isEmpty, getId } from "../../utils/validation"
import LoginUser from "../../model/auth/LoginUser.model"
import Organization from "../../model/auth/Organization.model"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const login = async (req, res) => {
  try {
    let { email, password } = req.body || {}
    let user = await LoginUser.findOne({ email: email })
    if (isEmpty(email) || isEmpty(password)) {
      throw new Error("Email and password required")
    }
    if (isEmpty(user)) throw new Error("Incorrect email id")

    let hashComparision = await bcrypt.compare(password, user.password)
    if (hashComparision) {
      const userDetails = { email: email }
      const accessToken = jwt.sign(userDetails, process.env.ACCESS_TOKEN)
      if (isEmpty(user.token)) {
        user.token = accessToken

        const data = await LoginUser.findOneAndUpdate({ _id: user._id }, user)
        res.cookie("albatross.login.token", accessToken, {
          maxAge: 900000,
          httpOnly: false,
          domain: "http://localhost:3000",
        })
        let { firstname, lastname, email, companyname } = user
        return res.status(200).json({
          data: {
            message: "User logged in successfully",
            token: accessToken,
            orgId: user.orgId,
            email: email,
            firstname: firstname,
            lastname: lastname,
            company: companyname,
          },
          error: null,
        })
      } else {
        let { firstname, lastname, companyname, token } = user
        return res.status(200).json({
          data: {
            message: "User logged in successfully",
            token: token,
            orgId: user.orgId,
            email: email,
            firstname: firstname,
            lastname: lastname,
            company: companyname,
          },
          error: null,
        })
      }
    } else {
      throw new Error("Incorrect password")
    }
  } catch (error) {
    return res.status(200).json(errorResponse(error))
  }
}

const logout = async (req, res) => {
  try {
    let { token } = req.body
    let user = await LoginUser.findOne({ token: token })
    if (isEmpty(user)) {
      return res.status(501).json(errorResponse(new Error("No User found")))
    } else {
      if (!isEmpty(user.token)) {
        user.token = ""
      }
      const data = await LoginUser.findOneAndUpdate({ _id: user._id }, user)
      return res.status(200).json({
        data: {
          message: "User logged out successfully",
        },
        error: null,
      })
    }
  } catch (error) {
    return res.status(500).json(errorResponse(error))
  }
}

const signup = async (req, res) => {
  try {
    const credentials = req.body
    let { password, email, companyname } = credentials
    let isEmailPresent = await LoginUser.findOne({ email: email })

    // Email present validation
    if (!isEmpty(isEmailPresent))
      throw new Error("User with that email is already present")

    // Empty email and password validation
    if (isEmpty(password) || isEmpty(email)) {
      throw new Error("Please fill email and password")
    }

    // password hashing and salting
    let salt = await bcrypt.genSalt(parseInt(process.env.SALT_PASSWORD))
    let hashedPwd = await bcrypt.hash(password, salt)
    credentials.password = hashedPwd

    // generate org id and db name based on company name
    let orgId = await getId(companyname, 999)
    let dbName = credentials.companyname.replaceAll(" ", "_") + "_" + orgId
    credentials.orgId = orgId
    credentials.dbName = dbName

    await LoginUser.create(credentials)

    let isOrgPresent = await Organization.findOne({
      orgId: orgId,
      name: companyname,
    })

    // check if any org with that org id is present if so then create an org
    if (isEmpty(isOrgPresent)) {
      let organizationCredentials = {
        orgId,
        dbName,
        name: credentials.companyname,
      }
      await Organization.create(organizationCredentials)
    }

    return res
      .status(200)
      .json({ data: { message: "User created successfully" } })
  } catch (error) {
    return res.status(500).json(errorResponse(error))
  }
}

const getAccount = async (req, res) => {
  try {
    let { token, orgId } = req.body
    let user = await LoginUser.findOne({ orgId, token })

    return res.status(200).json({ data: user, error: null })
  } catch (error) {
    return res.status(500).json(errorResponse(error))
  }
}

const updateAccount = async (req, res) => {
  try {
    let { _id, data } = req.body
    await LoginUser.findOneAndUpdate({ _id: _id }, data)

    return res
      .status(200)
      .json({ data: { message: "User updated successfully" }, error: null })
  } catch (error) {
    return res.status(500).json(errorResponse(error))
  }
}

export { login, signup, logout, getAccount, updateAccount }
