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
    name: {
      type: String,
      required: true,
      unique: 1,
      displayName: "Name",
      displayType: "STRING",
    },
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
    department: {
      type: String,
      displayName: "Department",
      displayType: "ENUM",
      options: [
        { label: "Customer Support", value: "Customer Support" },
        { label: "Development", value: "Development" },
        { label: "Finance", value: "Finance" },
        { label: "Operations", value: "Operations" },
        { label: "IT", value: "IT" },
        { label: "HR", value: "HR" },
        { label: "Sales", value: "Sales" },
        { label: "Marketing", value: "Marketing" },
      ],
    },
    state: { type: String, displayName: "State", displayType: "STRING" },
    expenses: {
      type: Number,
      displayName: "Expenses",
      displayType: "NUMBER",
      unit: "Dollars",
      metric: "$",
    },
    usage: {
      type: String,
      displayName: "Usage",
      displayType: "NUMBER",
      unit: "Percentage",
      metric: "%",
    },
    url: { type: String, displayName: "URL", displayType: "LINK" },
  },
  { strict: false }
)
