import mongoose from "mongoose"

export const SubscriptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: 1, displayName: "Name" },
    id: { type: Number, required: true, unique: 1, displayName: "Id" },
    url: { type: String, displayName: "URL" },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    owner: { type: String, required: true, displayName: "Owner" },
    department: { type: String, displayName: "Department" },
    state: { type: String, displayName: "State" },
    expenses: { type: Number, displayName: "Expenses" },
    usage: { type: String, displayName: "Usage" },
  },
  { strict: false }
)
