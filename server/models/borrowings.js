import mongoose from "mongoose";


const BorrowingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    quantity: { type: Number, required: true, default: 1 },

    borrowDate: { type: Date, default: Date.now },
    dueDate: { type: Date },

    // ⚙️ Trạng thái đơn: borrowed | returned | damaged | lost | overdue
    status: {
      type: String,
      enum: ["borrowed", "returned", "damaged", "lost", "overdue"],
      default: "borrowed",
    },

    // Lưu thông tin snapshot phòng khi user/book bị xóa
    userSnapshot: {
      fullName: String,
      studentId: String,
      course: String,
      email: String,
    },
    bookSnapshot: {
      title: String,
      author: String,
      isbn: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Borrowing", BorrowingSchema);

