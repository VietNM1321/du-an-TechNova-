import express from "express";
import Category from "../models/category.js";

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
    const { name, description } = req.body;
    const newCategory = new Category({ name, description });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ message: "Thêm thất bại", error });
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
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa thành công" });
  } catch (error) {
    res.status(400).json({ message: "Xóa thất bại", error });
  }
});

export default router;
