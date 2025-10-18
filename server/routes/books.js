import express from "express";
import mongoose from "mongoose";
import Book from "../models/books.js";
import Reviews from "../models/review.js";

const router = express.Router();
router.get("/", async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      if (mongoose.Types.ObjectId.isValid(req.query.category)) {
        filter.category = req.query.category;
      } else {
        const { default: Category } = await import("../models/category.js");
        const categoryDoc = await Category.findOne({ name: req.query.category });
        if (categoryDoc) filter.category = categoryDoc._id;
        else return res.status(404).json({ message: "Không tìm thấy thể loại" });
      }
    }

    const books = await Book.find(filter)
      .populate("category", "name")
      .populate("author", "name");

    const booksWithReviews = await Promise.all(
      books.map(async (book) => {
        const reviews = await Reviews.find({ bookId: book._id }).populate("userId", "name email");
        return { ...book.toObject(), reviews };
      })
    );

    res.json(booksWithReviews);
  } catch (error) {
    console.error("Lỗi lấy danh sách sách:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
});
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Vui lòng nhập từ khóa tìm kiếm" });
    }

    const books = await Book.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    })
      .populate("author", "name")
      .populate("category", "name");

    res.json(books);
  } catch (error) {
    console.error("❌ Lỗi khi tìm kiếm sách:", error);
    res.status(500).json({ message: "Lỗi server khi tìm kiếm", error });
  }
});
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const book = await Book.findById(req.params.id)
      .populate("category", "name")
      .populate("author", "name");

    if (!book) return res.status(404).json({ message: "Không tìm thấy sách" });

    book.views = (book.views || 0) + 1;
    await book.save();

    const reviews = await Reviews.find({ bookId: book._id }).populate("userId", "name email");

    res.json({ ...book.toObject(), reviews });
  } catch (error) {
    console.error("Lỗi lấy chi tiết sách:", error);
    res.status(500).json({ message: "Lỗi server khi lấy sách", error });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      images,
      category,
      author,
      publisher,
      publishedYear,
      quantity,
      available,
    } = req.body;

    if (!title || !images || images.length === 0 || !publishedYear) {
      return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin bắt buộc" });
    }

    const imageArray = typeof images === "string" ? [images] : images;

    const newBook = new Book({
      title,
      description,
      images: imageArray,
      category,
      author,
      publisher,
      publishedYear,
      quantity: quantity || 0,
      available: available || 0,
      views: 0,
    });

    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    console.error("Lỗi thêm sách:", error);
    res.status(400).json({ message: "Thêm sách thất bại", error });
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const updatedData = { ...req.body };
    if (updatedData.images && typeof updatedData.images === "string") {
      updatedData.images = [updatedData.images];
    }

    const updatedBook = await Book.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (!updatedBook) return res.status(404).json({ message: "Không tìm thấy sách để cập nhật" });

    res.json(updatedBook);
  } catch (error) {
    console.error("❌ Lỗi cập nhật sách:", error);
    res.status(500).json({ message: "Cập nhật thất bại", error });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) return res.status(404).json({ message: "Không tìm thấy sách để xóa" });

    await Reviews.deleteMany({ bookId: deletedBook._id });
    res.json({ message: "Sách đã được xóa cùng reviews" });
  } catch (error) {
    console.error("❌ Lỗi xóa sách:", error);
    res.status(500).json({ message: "Xóa thất bại", error });
  }
});

export default router;
