import mongoose from "mongoose"

export const JobsSchema = new mongoose.Schema({
  job: { type: Object, index: true },
  moduleName: {
    type: String,
    id: 3,
    displayName: "Module Name",
    displayType: "TEXT",
  },
  config: { type: Object, index: true },
  pattern: { type: String, id: 2, displayName: "Pattern", displayType: "TEXT" },
  name: {
    type: String,
    required: true,
    id: 1,
    displayName: "Unique ID",
    displayType: "TEXT",
  },
})
