import mongoose from "mongoose"

export const UsersSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: 1,
    id: 1,
    displayName: "ID",
    displayType: "ID",
    primaryField: true,
  },
  name: {
    type: String,
    required: true,
    id: 2,
    displayName: "Name",
    primaryField: true,
  },
  description: { type: String, id: 3, displayName: "Description" },
  userId: {
    type: String,
    required: true,
    unique: 1,
    id: 4,
    displayName: "User Id",
    displayType: "COPY",
  },
  email: { type: String, id: 5, displayName: "Email" },
  phone: { type: String, id: 6, displayName: "Phone" },
  projects: { type: Array, id: 8, lookup: true },
  featureGroup: { type: Array, id: 9, lookup: true },
})
