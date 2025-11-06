import mongoose from "mongoose";
import { verifyToken, requireRole } from "../middleware/auth.js";


const BorrowingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    quantity: { type: Number, required: true, default: 1 },

    borrowDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    returnDate: { type: Date },

    // 🟢 Trạng thái đơn mượn
    status: {
      type: String,
      enum: ["borrowed", "returned", "damaged", "lost", "overdue"],
      default: "borrowed",
    },

    // 📸 Khi báo hỏng hoặc mất
    damageType: { type: String, enum: ["broken", "lost", null], default: null }, // broken=hỏng, lost=mất
    damageReason: { type: String }, // lý do sinh viên gửi
    damageImage: { type: String }, // đường dẫn ảnh upload
    compensationAmount: { type: Number, default: 0 }, // tiền đền (admin nhập)

    // 🧍 Dữ liệu snapshot sinh viên (khi mượn)
    userSnapshot: {
      fullName: String,
      studentId: String,
      course: String,
      email: String,
    },

    // 📚 Dữ liệu snapshot sách (khi mượn)
    bookSnapshot: {
      title: String,
      author: String,
      isbn: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Borrowing", BorrowingSchema);
