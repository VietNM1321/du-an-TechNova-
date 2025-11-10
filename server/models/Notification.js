import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true }, // ngày admin chọn
    image: { type: String },
    wordFile: { type: String },
    excelFile: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
