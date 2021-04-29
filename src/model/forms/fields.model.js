import mongoose from "mongoose"

export const FieldSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: 1 },
    id: { type: Number, required: true, unique: 1 },
    displayName: { type: String, required: true },
    moduleName: { type: String, required: true },
    displayType: { type: String },
    type: { type: String, required: true },
  },
  { strict: false }
)
