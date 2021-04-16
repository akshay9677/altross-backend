import mongoose from "mongoose"

export const SubscriptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String },
  users: { type: String },
  owner: { type: String, required: true },
  department: { type: String },
  state: { type: String },
  cost: { type: Number },
})
