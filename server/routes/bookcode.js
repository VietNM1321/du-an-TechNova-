import express from "express";
import mongoose from "mongoose";
import BookCode from "../models/bookcode.js";
import Book from "../models/books.js"
import Category from "../models/category.js";

const router = express.Router();
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await BookCode.countDocuments();
    const bookcodes = await BookCode.find()
      .populate("category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json({
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      bookcodes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});
router.get("/category/:categoryId", async (req, res) => {
  try {
    const bookCode = await BookCode.findOne({ category: req.params.categoryId });
    if (!bookCode) {
<<<<<<< HEAD
      return res.status(404).json({ message: "BookCode not found for this category" });
=======
       return res.json(null);
>>>>>>> origin/main
    }
    res.json(bookCode);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
<<<<<<< HEAD
    if (!category || !prefix) return res.status(400).json({ message: "Category và prefix bắt buộc" });
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) return res.status(404).json({ message: "Category không tồn tại" });
    const existing = await BookCode.findOne({ category });
    if (existing) return res.status(400).json({ message: "Đã có BookCode cho category này" });

    const newBookCode = new BookCode({ category, prefix, lastNumber: 0 });
    await newBookCode.save();
    res.status(201).json(newBookCode);
  } catch (err) {
=======
    if (!category || !prefix)
      return res.status(400).json({ message: "Category và prefix bắt buộc" });

    const categoryDoc = await Category.findById(category);
    if (!categoryDoc)
      return res.status(404).json({ message: "Category không tồn tại" });

    const existing = await BookCode.findOne({ category });
    if (existing)
      return res.status(400).json({ message: "Đã có BookCode cho category này" });
    const newBookCode = new BookCode({ category, prefix, lastNumber: 0 });
    await newBookCode.save();
    const books = await Book.find({ category });

    if (books.length === 0) {
      return res.status(201).json({
        message: "✅ Thêm BookCode thành công (danh mục chưa có sách nào)",
        bookCode: newBookCode,
      });
    }
    const bulkOps = books.map((book, index) => {
      const sequenceNumber = String(index + 1).padStart(3, "0");
      return {
        updateOne: {
          filter: { _id: book._id },
          update: { code: `${prefix}-${sequenceNumber}`, bookCode: newBookCode._id },
        },
      };
    });

    if (bulkOps.length > 0) await Book.bulkWrite(bulkOps);

    res.status(201).json({
      message: `✅ Thêm BookCode và gán mã cho ${books.length} sách`,
      bookCode: newBookCode,
    });
  } catch (err) {
    console.error("❌ Lỗi thêm BookCode:", err);
>>>>>>> origin/main
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});
router.put("/:id", async (req, res) => {
  try {
    const { prefix } = req.body;
    if (!prefix) return res.status(400).json({ message: "Prefix bắt buộc" });
    const bookCode = await BookCode.findById(req.params.id);
    if (!bookCode) return res.status(404).json({ message: "Không tìm thấy BookCode" });
    const oldPrefix = bookCode.prefix;
    bookCode.prefix = prefix;
    await bookCode.save();
    const books = await Book.find({ category: bookCode.category });
    try {
      const bulkOps = books.map((book, index) => {
        const sequenceNumber = String(index + 1).padStart(3, '0');
        return {
          updateOne: {
            filter: { _id: book._id },
            update: { 
              $set: { 
                code: `${prefix}-${sequenceNumber}`,
                bookCode: bookCode._id
              }
            }
          }
        };
      });
      if (bulkOps.length > 0) {
        await Book.bulkWrite(bulkOps);
      }
      console.log(`Đã cập nhật BookCode từ ${oldPrefix} thành ${prefix} cho ${books.length} sách`);
      
      const updated = await BookCode.findById(req.params.id).populate("category", "name");
      res.json({ 
        bookCode: updated,
        message: `✅ Đã cập nhật mã sách cho ${books.length} quyển sách`,
        updatedBooks: books.length
      });
    } catch (bulkError) {
      console.error("Lỗi khi cập nhật sách:", bulkError);
      bookCode.prefix = oldPrefix;
      await bookCode.save();
      throw new Error("Lỗi khi cập nhật mã sách: " + bulkError.message);
    }
  } catch (err) {
    console.error("Lỗi cập nhật BookCode:", err);
    res.status(500).json({ 
      message: "Lỗi khi cập nhật: " + (err.message || "Không xác định"),
      error: err.message 
    });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const count = await Book.countDocuments({ bookCode: id });
    if (count > 0) {
      return res.status(400).json({
        message: "Không thể xóa BookCode vì đang có sách sử dụng",
      });
    }

    await BookCode.findByIdAndDelete(id);
    res.json({ message: "✅ Xóa BookCode thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;