import mongoose from "mongoose"

export const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: 1, displayName: "Name" },
  id: { type: Number, required: true, unique: 1, displayName: "Id" },
  email: { type: String, required: true, unique: 1, displayName: "Email" },
  phone: { type: Number, displayName: "Phone" },
  department: { type: String, displayName: "Department" },
  subscriptions: [
    {
      type: Number,
      ref: "Subscriptions",
      lookup: true,
    },
  ],
  usage: { type: String, displayName: "Usage" },
})
