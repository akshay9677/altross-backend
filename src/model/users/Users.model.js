import mongoose from "mongoose"

export const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: 1,
    displayName: "Name",
    displayType: "USER",
    id: 1,
    primaryField: true,
  },
  description: {
    type: String,
    displayName: "Description",
    displayType: "TEXT_AREA",
    id: 2,
  },
  id: {
    type: Number,
    required: true,
    unique: 1,
    displayName: "Id",
    displayType: "ID",
    id: 0,
    primaryField: true,
  },
  email: {
    type: String,
    required: true,
    unique: 1,
    displayName: "Email",
    id: 3,
  },
  phone: { type: Number, displayName: "Phone", id: 4 },
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
  subscriptions: [
    {
      type: Number,
      ref: "Subscriptions",
      lookup: true,
    },
  ],
  usage: { type: String, displayName: "Usage", id: 6 },
})
