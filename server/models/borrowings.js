import mongoose from "mongoose";

const BorrowingSchema = new mongoose.Schema(
  {
    // 🧍 Người mượn
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    // 📚 Sách mượn
    book: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Book", 
      required: true 
    },

    // 🔢 Số lượng
    quantity: { 
      type: Number, 
      required: true, 
      default: 1 
    },

    // 📅 Các mốc thời gian
    borrowDate: { type: Date, default: Date.now },     // Ngày mượn
    dueDate: { type: Date },                           // Ngày hẹn trả
    returnDate: { type: Date },                        // Ngày trả

    // 🟢 Trạng thái đơn mượn
    status: {
      type: String,
      enum: [
        "pendingPickup",   // Chờ sinh viên đến lấy
        "borrowed",        // Đã nhận sách
        "renewed",         // Đã gia hạn
        "returned",        // Đã trả
        "overdue",         // Quá hạn
        "damaged",         // Báo hỏng
        "lost",            // Báo mất
        "compensated"      // Đã bồi thường
      ],
      default: "pendingPickup",
      required: true,
    },

    // 🟦 Đánh dấu sinh viên đã nhận sách
    isPickedUp: { type: Boolean, default: false },

    // 🔄 Số lần gia hạn
    renewCount: { type: Number, default: 0 },

    // 🧾 Ghi chú xử lý hỏng/mất
    damageType: { 
      type: String, 
      enum: ["broken", "lost", null], 
      default: null 
    },
    damageReason: { type: String },
    damageImage: { type: String },   // đường dẫn ảnh báo hỏng/mất
    compensationAmount: { 
      type: Number, 
      default: 50000 
    },

    // 💰 Thông tin thanh toán
    paymentMethod: { 
      type: String, 
      enum: ["cash", "bank", null], 
      default: null 
    },
    paymentStatus: { 
      type: String, 
      enum: ["pending", "paid", "completed"], 
      default: "pending" 
    },
    paymentDate: { type: Date },
    qrCodeImage: { type: String },
    paymentNote: { type: String },

    // 🧍 Lưu lại thông tin sinh viên tại thời điểm mượn
    userSnapshot: {
      fullName: String,
      studentId: String,
      course: String,
      email: String,
    },

    // 📚 Lưu lại thông tin sách tại thời điểm mượn
    bookSnapshot: {
      title: String,
      author: String,
      isbn: String,
    },

    // 🔖 Mã đơn mượn (gộp những đơn cùng ngày)
    // Lưu ý: KHÔNG để `unique: true` ở đây vì nhiều document cùng ngày
    // sẽ có cùng mã (gộp đơn). Chỉ giữ index để tìm kiếm nhanh.
    borrowingCode: {
      type: String,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Borrowing", BorrowingSchema);
