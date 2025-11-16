import mongoose from "mongoose";

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
      enum: ["borrowed", "renewed", "returned", "damaged", "lost", "overdue"],
      default: "borrowed",
    },

    // 🟦 NEW: Quản lý xác nhận sinh viên đã nhận sách
  isPickedUp: { type: Boolean, default: false },

  // Số lần gia hạn
  renewCount: { type: Number, default: 0 },

    // 📸 Khi báo hỏng hoặc mất
    damageType: { type: String, enum: ["broken", "lost", null], default: null },
    damageReason: { type: String },
    damageImage: { type: String },
    compensationAmount: { type: Number, default: 50000 },

    // 💰 Thông tin thanh toán
    paymentMethod: { type: String, enum: ["cash", "bank", null], default: null },
    paymentStatus: { type: String, enum: ["pending", "paid", "completed"], default: "pending" },
    paymentDate: { type: Date },
    qrCodeImage: { type: String },
    paymentNote: { type: String },

    // 🧍 Snapshot sinh viên
    userSnapshot: {
      fullName: String,
      studentId: String,
      course: String,
      email: String,
    },

    // 📚 Snapshot sách
    bookSnapshot: {
      title: String,
      author: String,
      isbn: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Borrowing", BorrowingSchema);
