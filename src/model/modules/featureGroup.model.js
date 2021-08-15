import mongoose from "mongoose"

export const FeatureGroupModel = new mongoose.Schema({
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
  tags: { type: Array, id: 4, displayName: "Tags", displayType: "TAG" },
  projects: { type: Array, id: 5, lookup: true },
  users: {
    type: Array,
    id: 6,
    lookup: true,
    displayName: "Users",
    displayType: "MULTI_LOOKUP",
  },
  permissions: {
    type: Array,
    id: 7,
    lookup: true,
    displayName: "Permissions",
    displayType: "MULTI_LOOKUP",
  },
  userGroup: {
    type: Array,
    id: 8,
    lookup: true,
    displayName: "User Group",
    displayType: "MULTI_LOOKUP",
  },
  type: { type: String, displayName: "Group Type", enum: ["GLOBAL", "UNIQUE"] },
  createdFrom: {
    type: Array,
    displayName: "User Group Scope",
    displayType: "MULTI_LOOKUP",
    immutable: true,
  },
})
