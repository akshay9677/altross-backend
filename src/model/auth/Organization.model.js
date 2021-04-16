import mongoose from "mongoose"
const Organization = new mongoose.Schema({
  name: { type: String, required: true, unique: 1 },
  orgId: { type: Number, required: true },
  dbName: { type: String, required: true },
})

export default mongoose.model("Organization", Organization)
