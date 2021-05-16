import mongoose from "mongoose"

export const SubscriptionSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: 1,
      displayName: "Id",
      displayType: "ID",
      primaryField: true,
      id: 1,
    },
    name: {
      type: String,
      required: true,
      unique: 1,
      displayName: "Name",
      displayType: "STRING",
      primaryField: true,
      id: 2,
    },
    description: {
      type: String,
      displayName: "Description",
      displayType: "TEXT_AREA",
      id: 3,
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
      id: 4,
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
      id: 5,
    },
    state: {
      type: String,
      displayName: "State",
      displayType: "STRING",
      id: 11,
    },
    expenses: {
      type: Number,
      displayName: "Expenses",
      displayType: "NUMBER",
      metric: "Dollars",
      unit: "$",
      id: 6,
    },
    usage: {
      type: String,
      displayName: "Usage",
      displayType: "NUMBER",
      metric: "Percentage",
      unit: "%",
      id: 7,
    },
    url: { type: String, displayName: "URL", displayType: "LINK", id: 8 },
    isVerified: {
      type: Boolean,
      displayName: "Verified",
      trueVal: "Verified",
      falseVal: "Unverified",
      displayType: "RADIO",
      id: 9,
    },
    tags: {
      type: Array,
      displayName: "Tags",
      displayType: "TAG",
      id: 10,
    },
    notes: {
      type: Array,
    },
  },
  { strict: false }
)
