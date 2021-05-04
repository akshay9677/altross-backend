import mongoose from "mongoose"

export const ViewsSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: 1 },
  displayName: { type: String, required: true },
  id: { type: Number, required: true, unique: 1 },
  fields: [
    {
      type: Number,
      ref: "Users",
      lookup: true,
    },
  ],
  moduleName: { type: String, required: true },
})
