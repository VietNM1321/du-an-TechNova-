import mongoose from "mongoose";
const BorrowingSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    book: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Book", 
      required: true 
    },
    quantity: { 
      type: Number, 
      required: true, 
      default: 1 
    },
    borrowDate: { type: Date, default: Date.now },     // Ngày mượn
    dueDate: { type: Date },                           // Ngày hẹn trả
    returnDate: { type: Date },                        // Ngày trả
    status: {
      type: String,
      enum: [
        "pendingPickup",   // Chờ sinh viên đến lấy
        "borrowed",        // Đã nhận sách
        "renewed",         // Đã gia hạn
        "returned",        // Đã trả
        "overdue",
        "damaged",
        "lost",
        "compensated"
      ],
      default: "pendingPickup",
      required: true,
    },
    isPickedUp: { type: Boolean, default: false },
    renewCount: { type: Number, default: 0 },
    damageType: { 
      type: String, 
      enum: ["broken", "lost", null], 
      default: null 
    },
    damageReason: { type: String },
    damageImage: { type: String },
    compensationAmount: { 
      type: Number, 
      default: 50000 
    },
    paymentMethod: { 
      type: String, 
      enum: ["bank", "vnpay", null], 
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
    vnpTxnRef: { type: String },

    studentPickupImage: { type: String },
studentCardImage: { type: String },
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
    borrowingCode: {
      type: String,
      index: true,
    },
  },
  { timestamps: true }
);
export default mongoose.model("Borrowing", BorrowingSchema);