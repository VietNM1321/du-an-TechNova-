import express from "express";
import mongoose from "mongoose";
import BookCode from "../models/bookcode.js";
import Category from "../models/category.js";

const router = express.Router();
router.get("/", async (req, res) => {
  try {
    const bookcodes = await BookCode.find().populate("category", "name");
    res.json(bookcodes);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) 
      return res.status(400).json({ message: "ID không hợp lệ" });

    const bookcode = await BookCode.findById(req.params.id).populate("category", "name");
    if (!bookcode) return res.status(404).json({ message: "Không tìm thấy BookCode" });

    res.json(bookcode);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});
router.post("/", async (req, res) => {
  try {
    const { category, prefix } = req.body;
    if (!category || !prefix) return res.status(400).json({ message: "Category và prefix bắt buộc" });
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) return res.status(404).json({ message: "Category không tồn tại" });
    const existing = await BookCode.findOne({ category });
    if (existing) return res.status(400).json({ message: "Đã có BookCode cho category này" });

    const newBookCode = new BookCode({ category, prefix, lastNumber: 0 });
    await newBookCode.save();
    res.status(201).json(newBookCode);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});
router.put("/:id", async (req, res) => {
  try {
    const { prefix } = req.body;
    if (!prefix) return res.status(400).json({ message: "Prefix bắt buộc" });

    const updated = await BookCode.findByIdAndUpdate(
      req.params.id,
      { prefix },
      { new: true }
    ).populate("category", "name");

    if (!updated) return res.status(404).json({ message: "Không tìm thấy BookCode" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await BookCode.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy BookCode" });
    res.json({ message: "Xóa BookCode thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

export default router;