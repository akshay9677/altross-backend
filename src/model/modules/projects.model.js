import mongoose from "mongoose"

export const ProjectSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: 1,
    id: 1,
  },
  name: { type: String, required: true, id: 2 },
  projectId: { type: String, required: true, unique: 1, id: 3 },
  authToken: { type: String, required: true, unique: 1, id: 4 },
  users: { type: Array, id: 6, lookup: true },
  permissions: { type: Array, id: 7, lookup: true },
  description: { type: String, id: 8 },
})
