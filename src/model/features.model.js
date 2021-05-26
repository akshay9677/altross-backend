import mongoose from "mongoose"

export const FeaturesModel = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: 1,
    id: 1,
    displayName: "ID",
    displayType: "ID",
  },
  name: { type: String, required: true, id: 2, displayName: "Name" },
  featureId: {
    type: String,
    required: true,
    unique: 1,
    id: 3,
    displayName: "Feature Id",
  },
  projects: { type: Array, id: 4, lookup: true },
})
