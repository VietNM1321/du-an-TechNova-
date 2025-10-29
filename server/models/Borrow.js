import mongoose from "mongoose";

const borrowSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  fullName: { type: String, required: true },
  studentId: { type: String, required: true },
  email: { type: String, required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  bookTitle: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  borrowDate: { type: Date, default: Date.now },
  returnDate: { type: Date, default: null },
  status: { type: String, default: "Đang mượn" }, // hoặc "Đã trả"
});

const Borrow = mongoose.model("Borrow", borrowSchema);

export default Borrow;
