import express from "express";
import Book from "../models/books.js";

const router = express.Router();

// Lấy danh sách sách (hiển thị kèm thể loại và tác giả)
router.get("/", async (req, res) => {
  try {
    const books = await Book.find()
      .populate("category", "name")
      .populate("author", "name");
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
});

// Thêm sách mới
router.post("/", async (req, res) => {
  try {
    const { title, description, price, image, category, author } = req.body;
    const newBook = new Book({ title, description, price, image, category, author });
    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    res.status(400).json({ message: "Thêm sách thất bại", error });
  }
});

export default router;
