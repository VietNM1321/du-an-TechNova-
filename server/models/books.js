import mongoose from "mongoose";

const BookSchema = new mongoose.Schema(
  {
    code: { 
      type: String,
      required: true,
      unique: true 
    },
    bookCode: { 
      type: mongoose.Schema.Types.ObjectId, ref: "BookCode" },
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
        type: mongoose.Schema.Types.ObjectId, ref: "Author"
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Book = mongoose.model("Book", BookSchema);
export default Book;
