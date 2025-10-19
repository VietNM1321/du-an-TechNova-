import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  quantity: { type: Number, default: 1, min: 1 },
  price: { type: Number },
  fullName: { type: String },
  studentId: { type: String },
  email: { type: String },
  borrowDate: { type: String },
  returnDate: { type: String },
});

const CartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Cart", CartSchema);
