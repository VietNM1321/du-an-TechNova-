import express from "express";
import mongoose from "mongoose";
import Category from "../models/category.js";
import Book from "../models/books.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const category = await Category.find();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
});
router.post("/", async (req, res) => {
  try {
    console.log("POST /api/category body:", req.body);
    const { name, description } = req.body;

    if (!name || !name.toString().trim()) {
      return res.status(400).json({ message: "Tên danh mục (name) là bắt buộc." });
    }
    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Danh mục này đã tồn tại." });
    }

    const newCategory = new Category({ name, description });
    const saved = await newCategory.save();

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Cập nhật thất bại", error });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting category ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID danh mục không hợp lệ" });
    }

    const bookCount = await Book.countDocuments({ category: id });
    console.log("Số sách thuộc danh mục:", bookCount);

    if (bookCount > 0) {
      return res.status(400).json({ message: "Danh mục đang có sách, không thể xóa!" });
    }

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy danh mục!" });
    }

    res.json({ message: "Xóa danh mục thành công" });
  } catch (error) {
    console.error("❌ Lỗi xóa danh mục:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

export default router;

