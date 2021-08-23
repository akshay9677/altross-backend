import mongoose from "mongoose"

export const ViewsSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: 1 },
  displayName: { type: String, required: true },
  description: { type: String },
  id: { type: Number, required: true, unique: 1 },
  fields: { type: Array, id: 4 },
  moduleName: { type: String, required: true },
})
