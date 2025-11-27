// bảng quản lý thời gian trả sách
import mongoose from "mongoose";
const returnLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,ref: "User",
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,ref: "Book",required: true,
    },
    borrowId: {
      type: mongoose.Schema.Types.ObjectId,ref: "Borrow",
    },
    dueDate: {
      type: Date,
    },
    isLate: { // cái này tick trả trễ hay không
      type: Boolean,
      required: true,
    },
    note: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ReturnLog = mongoose.model("ReturnLog", returnLogSchema);
export default ReturnLog;
