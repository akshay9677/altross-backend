import mongoose from "mongoose"

export const SubscriptionSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: 1,
      displayName: "Id",
      displayType: "ID",
    },
    name: { type: String, required: true, unique: 1, displayName: "Name" },
    url: { type: String, displayName: "URL", displayType: "LINK" },
    users: [
      {
        type: Number,
        ref: "Users",
        lookup: true,
      },
    ],
    owner: {
      type: String,
      required: true,
      displayName: "Owner",
      displayType: "USER",
    },
    department: { type: String, displayName: "Department" },
    state: { type: String, displayName: "State" },
    expenses: { type: Number, displayName: "Expenses" },
    usage: { type: String, displayName: "Usage" },
  },
  { strict: false }
)
