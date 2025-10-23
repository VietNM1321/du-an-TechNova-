import mongoose from "mongoose";

const BookCodeSchema = new mongoose.Schema({
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Category", 
    required: true,
    unique: true
  },
  prefix: { type: String, required: true },
  lastNumber: { type: Number, default: 0 },
}, { timestamps: true, versionKey: false });

const BookCode = mongoose.model("BookCode", BookCodeSchema);
export default BookCode;