import mongoose from "mongoose"

export const NotificationSchema = new mongoose.Schema({
  title: { type: String },
  subject: { type: String },
  id: { type: Number },
  notificationStatus: { type: String, enum: ["SEEN", "UNSEEN"] },
  moduleName: { type: String },
  actionData: { type: Object },
  event: { type: String },
})
