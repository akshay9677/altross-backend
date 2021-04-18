import mongoose from "mongoose"

export const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: 1, displayName: "Name" },
  id: { type: Number, required: true, unique: 1, displayName: "Id" },
  email: { type: String, required: true, unique: 1, displayName: "Email" },
  phone: { type: Number, displayName: "Phone" },
  department: { type: String, displayName: "Department" },
  subscriptions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscriptions",
    },
  ],
  usage: { type: String, displayName: "Usage" },
})
