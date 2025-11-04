import mongoose from "mongoose";

const BookSchema = new mongoose.Schema(
  {
    code: { 
      type: String,
      required: true,
      unique: true 
    },
    bookCode: { 
<<<<<<< HEAD
      type: mongoose.Schema.Types.ObjectId, ref: "BookCode" },
=======
      type: mongoose.Schema.Types.ObjectId, ref: "BookCode" 
    },
>>>>>>> origin/main
    title: { 
      type: String,
      required: [true, "Vui lòng cung cấp tên sách"],
      trim: true,
    },
    images: [
      {
        type: String,
        required: [true, "Vui lòng cung cấp hình ảnh sách"],
      },
    ],
    description: {
      type: String,
      trim: true,
    },
    author: {
<<<<<<< HEAD
        type: mongoose.Schema.Types.ObjectId, ref: "Author"
=======
      type: mongoose.Schema.Types.ObjectId, ref: "Author"
>>>>>>> origin/main
    },
    publisher: {
      type: mongoose.Schema.Types.ObjectId, ref: "Publisher"
    },
    category: {
      type: mongoose.Schema.Types.ObjectId, ref: "Category"
    },
    quantity: {
      type: Number,
      default: 0,
    },
    available: {
      type: Number,
      default: function () {
        return this.quantity;
      },
    },
    publishedYear: {
      type: Number,
      required: [true, "Vui lòng chọn năm xuất bản"],
      min: [100, "Năm xuất bản không hợp lệ, phải > 100"],
    },
    views: {
      type: Number,
      default: 0,
    },
<<<<<<< HEAD
=======
    borrowCount: {
      type: Number,
      default: 0,
    },
    importHistory: [
      {
        date: { type: Date, default: Date.now },
        quantity: { type: Number, required: true },
        note: { type: String },
      },
    ],
>>>>>>> origin/main
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Book = mongoose.model("Book", BookSchema);
export default Book;
