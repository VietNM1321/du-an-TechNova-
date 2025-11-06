import express from "express";
import mongoose from "mongoose";
import ImportWarehouse from "../models/importWarehouse.js";
import Book from "../models/books.js";

const router = express.Router();
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const total = await ImportWarehouse.countDocuments();
    const imports = await ImportWarehouse.find()
      .populate("book", "title")
      .populate("user", "fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      imports,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalItems: total,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách nhập kho",
      error: err.message,
    });
  }
});
router.post("/", async (req, res) => {
  try {
    const { bookId, quantity, supplier, note, user } = req.body;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "ID sách không hợp lệ" });
    }
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Số lượng phải lớn hơn 0" });
    }

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Không tìm thấy sách" });
    const importUser = user || "674f00f48a7b9b4c4b8e7a22";

    const newImport = await ImportWarehouse.create({
      book: bookId,
      quantity: Number(quantity),
      supplier,
      note,
      user: importUser,
    });

    book.quantity += Number(quantity);
    book.available += Number(quantity);
    await book.save();

    res.status(201).json({
      message: `✅ Nhập ${quantity} quyển cho "${book.title}" thành công!`,
      import: newImport,
    });
  } catch (err) {
    console.error("❌ Lỗi thêm phiếu nhập:", err);
    res.status(500).json({ message: "Lỗi thêm phiếu nhập", error: err.message });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const importRecord = await ImportWarehouse.findById(req.params.id);
    if (!importRecord) return res.status(404).json({ message: "Không tìm thấy phiếu nhập" });

    const book = await Book.findById(importRecord.book);
    if (book) {
      // cập nhập số lượng phiếu khi thao tác
      book.quantity -= importRecord.quantity;
      book.available -= importRecord.quantity;
      if (book.quantity < 0) book.quantity = 0;
      if (book.available < 0) book.available = 0;
      await book.save();
    }

    await importRecord.deleteOne();
    res.json({ message: "🗑️ Xóa phiếu nhập thành công!" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xóa phiếu nhập", error: err.message });
  }
});

export default router;
