import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import fs from "fs";
import Book from "../models/books.js";
import { verifyToken, requireRole } from "../middleware/auth.js";
import Reviews from "../models/review.js";
import Borrowing from "../models/borrowings.js";
import ImportWarehouse from "../models/importWarehouse.js";
import BookCode from "../models/bookcode.js";
const router = express.Router();
const uploadPath = "uploads/books";
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });
router.get("/", async (req, res) => {
  try {
    const filter = {};
    const { q, author, yearFrom, yearTo, availableMin, sort, order } = req.query;
    if (q && q.trim()) {
      const text = q.trim();
      filter.$or = [
        { title: { $regex: text, $options: "i" } },
        { description: { $regex: text, $options: "i" } },
        { code: { $regex: text, $options: "i" } },
      ];
    }
    if (author && mongoose.Types.ObjectId.isValid(author)) {
      filter.author = author;
    }
    if (yearFrom || yearTo) {
      filter.publishedYear = {};
      if (yearFrom) filter.publishedYear.$gte = Number(yearFrom);
      if (yearTo) filter.publishedYear.$lte = Number(yearTo);
    }
    if (availableMin !== undefined) {
      const min = Number(availableMin);
      if (!Number.isNaN(min)) {
        filter.available = { $gte: min };
      }
    }
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const totalBooks = await Book.countDocuments(filter);
    const sortSpec =
      sort
        ? { [sort]: (order || "desc").toLowerCase() === "asc" ? 1 : -1 }
        : { createdAt: -1 };
    const books = await Book.find(filter)
      .populate("category", "name")
      .populate("author", "name")
      .skip(skip)
      .limit(limit)
      .sort(sortSpec);
    const booksWithBorrowCount = await Promise.all(
      books.map(async (book) => {
        const borrowHistory = await Borrowing.find({ book: book._id });
        const borrowCount = borrowHistory.reduce((sum, b) => sum + (b.quantity || 1), 0);
        return {
          ...book.toObject(),
          borrowCount,
        };
      })
    );
    res.json({
      books: booksWithBorrowCount,
      currentPage: page,
      totalPages: Math.ceil(totalBooks / limit),
      totalItems: totalBooks,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách sách:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});
router.get("/search", async (req, res) => {
  try {
    const { q, author, category } = req.query;
    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Vui lòng nhập từ khóa tìm kiếm" });
    }
    const filter = {
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { code: { $regex: q, $options: "i" } },
      ],
    };
    if (author && mongoose.Types.ObjectId.isValid(author)) {
      filter.author = author;
    }
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    }
    const books = await Book.find(filter)
      .populate("author", "name")
      .populate("category", "name");

    if (!books.length) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm phù hợp." });
    }
    const booksWithBorrowCount = await Promise.all(
      books.map(async (book) => {
        const borrowHistory = await Borrowing.find({ book: book._id });
        const borrowCount = borrowHistory.reduce((sum, b) => sum + (b.quantity || 1), 0);
        return {
          ...book.toObject(),
          borrowCount,
        };
      })
    );
    res.json(booksWithBorrowCount);
  } catch (error) {
    console.error("❌ Lỗi khi tìm kiếm sách:", error);
    res.status(500).json({ message: "Lỗi server khi tìm kiếm sách.", error: error.message });
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
    if (book.code) {
      await book.save();
    }
    const importHistory = await ImportWarehouse.find({ book: book._id })
    .populate("user", "fullName role")
    .sort({ createdAt: -1 });
    const borrowHistory = await Borrowing.find({ book: book._id })
      .populate("user", "fullName email")
      .sort({ borrowDate: -1 });
    const borrowCount = borrowHistory.reduce((sum, b) => sum + (b.quantity || 1), 0);
    const reviews = await Reviews.find({ bookId: book._id }).populate("userId", "name email");
    res.json({ ...book.toObject(), reviews, imports: importHistory, borrowHistory, borrowCount });
  } catch (error) {
    console.error("Lỗi lấy chi tiết sách:", error);
    res.status(500).json({ message: "Lỗi server khi lấy sách", error: error.message });
  }
});
router.post("/", verifyToken, requireRole("admin"), upload.array("images", 10), async (req, res) => {
  try {
    const { title, description, category, author, publishedYear, quantity, available, Pricebook } = req.body;
    if (!title || !category || !publishedYear) {
      return res.status(400).json({ 
        message: "Thiếu thông tin bắt buộc",
        details: {
          title: !title ? "Thiếu tiêu đề" : null,
          category: !category ? "Thiếu thể loại" : null,
          publishedYear: !publishedYear ? "Thiếu năm xuất bản" : null
        }
      });
    }
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: "ID thể loại không hợp lệ" });
    }
    let bookCodeDoc = await BookCode.findOne({ category });
    if (!bookCodeDoc) {
      bookCodeDoc = await BookCode.create({ category, prefix: "BC", lastNumber: 0 });
    }
    let isUnique = false;
    let attempts = 0;
    let newNumber = bookCodeDoc.lastNumber;
    let bookCode;
    while (!isUnique && attempts < 100) {
      attempts++;
      newNumber++;
      bookCode = `${bookCodeDoc.prefix}-${String(newNumber).padStart(3, "0")}`;
      const existingBook = await Book.findOne({ code: bookCode });
      if (!existingBook) {
        isUnique = true;
        bookCodeDoc.lastNumber = newNumber;
        await bookCodeDoc.save();
      }
    }
    if (!isUnique) {
      throw new Error("Không thể tạo mã sách duy nhất sau nhiều lần thử");
    }
    const parsedCompensation =
      Pricebook !== undefined && Pricebook !== null
        ? Number(Pricebook)
        : undefined;
    if (parsedCompensation !== undefined && (Number.isNaN(parsedCompensation) || parsedCompensation < 0)) {
      return res.status(400).json({ message: "Giá đền bù phải là số không âm" });
    }
    const images = req.files?.map(file => `${req.protocol}://${req.get("host")}/uploads/books/${file.filename}`) || [];
    const newBook = await Book.create({
      title: title.trim(),
      description: description?.trim() || "",
      images,
      category,
      author: author || null,
      publishedYear: Number(publishedYear),
      quantity: Number(quantity) || 0,
      available: Number(available) || Number(quantity) || 0,
      views: 0,
      code: bookCode,
      bookCode: bookCodeDoc._id,
      Pricebook: parsedCompensation ?? 50000,
    });
    const populatedBook = await Book.findById(newBook._id)
      .populate("category", "name")
      .populate("author", "name");
    res.status(201).json({ message: "✅ Thêm sách thành công", book: populatedBook });
  } catch (err) {
    console.error("Lỗi khi tạo sách:", err);
    res.status(500).json({ message: "Lỗi khi tạo sách mới", error: err.message });
  }
});
router.put("/:id", verifyToken, requireRole("admin"), upload.array("images", 10), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID sách không hợp lệ" });
    };
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Không tìm thấy sách" });
    let images = [...book.images];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `${req.protocol}://${req.get("host")}/uploads/books/${file.filename}`);
    } else if (req.body.images) {
      try {
        const parsedImages = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
        images = Array.isArray(parsedImages) ? parsedImages : [parsedImages];
      } catch (err) {
        images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      }
    }
    const parsedCompensation =
      req.body.Pricebook !== undefined && req.body.Pricebook !== null
        ? Number(req.body.Pricebook)
        : undefined;
    if (parsedCompensation !== undefined && (Number.isNaN(parsedCompensation) || parsedCompensation < 0)) {
      return res.status(400).json({ message: "Giá đền bù phải là số không âm" });
    }
    const updates = {
      title: req.body.title || book.title,
      description: req.body.description || book.description,
      category: req.body.category || book.category,
      author: req.body.author || book.author,
      publishedYear: req.body.publishedYear ? Number(req.body.publishedYear) : book.publishedYear,
      quantity: req.body.quantity !== undefined ? Number(req.body.quantity) : book.quantity,
      available: req.body.available !== undefined ? Number(req.body.available) : book.available,
      images: images,
    };
    if (parsedCompensation !== undefined) {
      updates.Pricebook = parsedCompensation;
    }
    const result = await Book.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true })
      .populate("category", "name")
      .populate("author", "name");
    res.json({ message: "✅ Cập nhật sách thành công", book: result });
  } catch (err) {
    console.error("Lỗi cập nhật sách:", err);
    res.status(500).json({ message: "Cập nhật thất bại", error: err.message });
  }
});
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    };
    
    // Kiểm tra xem sách có người mượn không
    const borrowCount = await Borrowing.countDocuments({
      bookId: req.params.id,
      status: { $in: ["active", "pending"] } // Kiểm tra các trạng thái mượn đang hoạt động
    });
    
    if (borrowCount > 0) {
      return res.status(400).json({ 
        message: `Không thể xóa sách vì đang có ${borrowCount} đơn mượn hoạt động` 
      });
    }
    
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) return res.status(404).json({ message: "Không tìm thấy sách để xóa" });
    await Reviews.deleteMany({ bookId: deletedBook._id });
    res.json({ message: "Sách đã được xóa cùng reviews" });
  } catch (error) {
    console.error("Lỗi xóa sách:", error);
    res.status(500).json({ message: "Xóa thất bại", error: error.message });
  }
});
router.put("/borrow/:id", verifyToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID sách không hợp lệ" });
    }
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Không tìm thấy sách" });
    const borrowQty = Number(quantity) > 0 ? Number(quantity) : 1;
    if (book.available < borrowQty) {
      return res.status(400).json({ message: `❌ Không đủ sách để mượn. Hiện chỉ còn ${book.available} quyển.` });
    }
    book.available -= borrowQty;
    await book.save();
    res.json({ message: `✅ Mượn thành công ${borrowQty} quyển. Còn lại: ${book.available}/${book.quantity}`, book });
  } catch (error) {
    console.error("Lỗi khi mượn sách:", error);
    res.status(500).json({ message: "Lỗi server khi mượn sách", error: error.message });
  }
});
router.put("/return/:id", verifyToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID sách không hợp lệ" });
    }
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Không tìm thấy sách để trả" });
    const returnQty = Number(quantity) > 0 ? Number(quantity) : 1;
    book.available += returnQty;
    if (book.available > book.quantity) book.available = book.quantity;
    await book.save();
    res.json({ message: `✅ Đã trả ${returnQty} quyển. Còn lại: ${book.available}/${book.quantity}`, book });
  } catch (error) {
    console.error("Lỗi khi trả sách:", error);
    res.status(500).json({ message: "Trả sách thất bại", error: error.message });
  }
});
export default router;