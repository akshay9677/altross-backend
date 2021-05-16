import mongoose from "mongoose"
const Users = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    phone: { type: Number, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: 1 },
    companyname: { type: String },
    token: { type: String },
    orgId: { type: Number, required: true },
    dbName: { type: String, required: true },
    avatar: {
      data: Buffer,
      contentType: String,
    },
    timezone: { type: String },
    language: { type: String },
  },
  { strict: false }
)

export default mongoose.model("Users", Users)
