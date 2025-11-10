import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["review", "borrow", "return", "system", "reminder"], // loại thông báo
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
      image: { type: String },      // đường dẫn ảnh
      wordFile: { type: String },   // đường dẫn file Word
      excelFile: { type: String },  // đường dẫn file Excel
      extra: mongoose.Schema.Types.Mixed, // lưu thêm dữ liệu tùy ý
    },
  },
  {
    timestamps: true, // createdAt, updatedAt tự động
    versionKey: false,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
