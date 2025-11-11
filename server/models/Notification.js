import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    type: {
      type: String,
      required: true,
      enum: ["general", "review", "borrow", "return", "system", "reminder"], 
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    data: {
      image: { type: String },
      wordFile: { type: String },
      excelFile: { type: String },
      extra: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
