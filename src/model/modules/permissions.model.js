import mongoose from "mongoose"

export const PermissionModel = new mongoose.Schema({
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
  owner: { type: String, id: 4, displayName: "Owner", displayType: "USER" },
  permissionId: {
    type: String,
    required: true,
    unique: 1,
    id: 5,
    displayName: "Permission Id",
    displayType: "COPY",
  },
  tags: { type: Array, id: 6, displayName: "Tags", displayType: "TAG" },
  projects: { type: Array, id: 7, lookup: true },
  permissionGroup: { type: Array, id: 8, lookup: true },
  conditions: [
    {
      dataType: {
        type: String,
        required: true,
        enum: ["String", "Number", "Array", "Boolean"],
      },
      key: { type: String, required: true },
      operator: { type: Number, required: true },
      value: { type: mongoose.Schema.Types.Mixed },
      valueKey: { type: String },
      valueType: { type: String, enum: ["STRICT", "DYNAMIC"], required: true },
      permissionGroup: { type: Number },
    },
  ],
  conditionMatcher: { type: String, id: 10 },
  conditionType: {
    type: String,
    id: 11,
    enum: ["CUSTOM", "MATCH_ALL", "MATCH_ANY"],
  },
  schedules: { type: Array, id: 12 },
  users: {
    type: Array,
    id: 13,
    lookup: true,
    displayName: "Users",
    displayType: "MULTI_LOOKUP",
  },
})
