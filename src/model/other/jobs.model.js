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
  executionDate: {
    type: String,
    id: 2,
    displayName: "Execution Date",
    displayType: "TEXT",
  },
  id: {
    type: String,
    required: true,
    id: 1,
    displayName: "Unique ID",
    displayType: "TEXT",
  },
})
