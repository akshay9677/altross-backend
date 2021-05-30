import mongoose from "mongoose"

export const UsersSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: 1,
    id: 1,
    displayName: "ID",
    displayType: "ID",
  },
  name: { type: String, required: true, id: 2, displayName: "Name" },
  description: { type: String, id: 3, displayName: "Description" },
  userId: {
    type: String,
    required: true,
    unique: 1,
    id: 4,
    displayName: "User Id",
  },
  email: { type: String, id: 5, displayName: "Email" },
  phone: { type: String, id: 6, displayName: "Phone" },
  orgs: { type: Array, id: 7, lookup: true, displayName: "Organization" },
  projects: { type: Array, id: 8, lookup: true },
})
