import mongoose from "mongoose"

export const FeaturesModel = new mongoose.Schema({
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
  owner: { type: String, id: 4, displayName: "Owner", displayType: "USER" },
  featureId: {
    type: String,
    required: true,
    unique: 1,
    id: 5,
    displayName: "Feature Id",
    displayType: "COPY",
  },
  tags: { type: Array, id: 6, displayName: "Tags", displayType: "TAG" },
  projects: { type: Array, id: 7, lookup: true },
  featureGroup: { type: Array, id: 8, lookup: true },
})
