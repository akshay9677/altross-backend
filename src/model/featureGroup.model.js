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
    primaryField: true,
  },
  description: { type: String, id: 3, displayName: "Description" },
  tags: { type: Array, id: 4, displayName: "Tags", displayType: "TAG" },
  projects: { type: Array, id: 5, lookup: true },
  users: {
    type: Array,
    id: 6,
    lookup: true,
    displayName: "Users",
    displayType: "MULTI_LOOKUP",
  },
  features: {
    type: Array,
    id: 7,
    lookup: true,
    displayName: "Features",
    displayType: "MULTI_LOOKUP",
  },
})
