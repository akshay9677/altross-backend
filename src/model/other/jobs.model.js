import mongoose from "mongoose"

export const JobsSchema = new mongoose.Schema({
  job: { type: Object, index: true },
  moduleName: { type: String },
  config: { type: Object, index: true },
  pattern: { type: String },
  name: { type: String, required: true },
})
