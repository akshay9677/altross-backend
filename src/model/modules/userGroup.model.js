import mongoose from "mongoose"

export const UserGroupModel = new mongoose.Schema({
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
  permissionGroup: {
    type: Array,
    id: 7,
    lookup: true,
    displayName: "Permission Group",
    displayType: "SINGLE_LOOKUP",
  },
  adminUsers: {
    type: Array,
    id: 8,
    displayName: "Admins",
    displayType: "RELATED_MULTI_LOOKUP",
    relatedFieldName: "users",
  },
})
