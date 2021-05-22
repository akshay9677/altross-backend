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
  userId: {
    type: String,
    required: true,
    unique: 1,
    id: 3,
    displayName: "User Id",
  },
  orgs: { type: Array, id: 4, lookup: true, displayName: "Organizations" },
  features: { type: Array, id: 5, lookup: true, displayName: "Features" },
  projects: { type: Array, id: 6, lookup: true },
})
