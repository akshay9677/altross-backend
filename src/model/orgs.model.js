import mongoose from "mongoose"

export const OrgSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: 1,
    id: 1,
  },
  name: { type: String, required: true, id: 2, unique: 1 },
  description: { type: String, id: 3 },
  projects: { type: Array, id: 4, lookup: true },
  users: { type: Array, id: 5, lookup: true, displayName: "Users" },
})
