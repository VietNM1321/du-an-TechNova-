import mongoose from "mongoose";

const borrowingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true,
  },
  quantity: { type: Number, required: true },
  borrowDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: Date,
  status: {
    type: String,
    enum: ["borrowed", "returned", "overdue"],
    default: "borrowed",
  },
  bookSnapshot: {
    title: String,
    images: [String],
    description: String,
    author: { name: String },
    publisher: { name: String },
    category: { name: String },
    quantity: Number,
    available: Number,
    publishedYear: Number,
  },
  userSnapshot: {
    name: String,
    email: String,
    phone: String,
    addresses: [String],
  },
});

export default mongoose.model("Borrowing", borrowingSchema);
