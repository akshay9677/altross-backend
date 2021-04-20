import mongoose from "mongoose"

export const WorkflowSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: 1 },
  id: { type: Number, required: true, unique: 1, displayName: "Id" },
  description: { type: String },
  conditions: [
    {
      field: { type: String, required: true },
      operator: { type: Number, required: true },
      value: { type: mongoose.Schema.Types.Mixed, required: true },
    },
  ],
  matchCondition: { type: String, enum: ["and", "or"], required: true },
  event: { type: String, enum: ["create", "update", "delete"] },
  actions: [{ type: String }],
  moduleName: { type: String, required: true },
})
