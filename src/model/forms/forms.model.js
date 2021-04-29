import mongoose from "mongoose"

export const FormSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: 1 },
  id: { type: Number, required: true, unique: 1 },
  description: { type: String },
  displayName: { type: String },
  groups: [
    {
      type: Object,
      lookup: true,
    },
  ],
  moduleName: { type: String, required: true },
})
