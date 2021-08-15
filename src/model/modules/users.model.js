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
    displayType: "TEXT",
    primaryField: true,
  },
  description: {
    type: String,
    id: 3,
    displayName: "Description",
    displayType: "TEXT",
  },
  userId: {
    type: String,
    required: true,
    unique: 1,
    id: 4,
    displayName: "User Id",
    displayType: "COPY",
  },
  email: { type: String, id: 5, displayName: "Email", displayType: "TEXT" },
  phone: { type: String, id: 6, displayName: "Phone", displayType: "NUMBER" },
  projects: { type: Array, id: 8, lookup: true },
  permissionGroup: {
    type: Array,
    id: 9,
    lookup: true,
    displayName: "Permission Group",
    displayType: "SINGLE_LOOKUP",
  },
  userGroup: {
    type: Array,
    id: 10,
    lookup: true,
    displayName: "User Group",
    displayType: "SINGLE_LOOKUP",
  },
  permissions: {
    type: Array,
    id: 11,
    lookup: true,
    displayName: "Permissions",
    displayType: "MULTI_LOOKUP",
  },
})
