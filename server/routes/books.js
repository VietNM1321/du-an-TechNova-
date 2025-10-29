import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import fs from "fs";
import Book from "../models/books.js";
import Reviews from "../models/review.js";
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
    const books = await Book.find(filter)
      .populate("category", "name")
      .populate("author", "name")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      books,
      currentPage: page,
      totalPages: Math.ceil(totalBooks / limit),
      totalItems: totalBooks,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách sách:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});
// 🔍 API tìm kiếm sách
router.get("/search", async (req, res) => {
  try {
    const { q, author } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Vui lòng nhập từ khóa tìm kiếm" });
    }

    const filter = {
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { code: { $regex: q, $options: "i" } }, // ✅ dùng code (string)
      ],
    };

    // 🟢 Nếu có filter theo tác giả
    if (author && mongoose.Types.ObjectId.isValid(author)) {
      filter.author = author;
    }

    const books = await Book.find(filter)
      .populate("author", "name")
      .populate("category", "name");

    if (!books.length) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm phù hợp." });
    }

    res.json(books);
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

    const reviews = await Reviews.find({ bookId: book._id }).populate("userId", "name email");
    res.json({ ...book.toObject(), reviews });
  } catch (error) {
    console.error("Lỗi lấy chi tiết sách:", error);
    res.status(500).json({ message: "Lỗi server khi lấy sách", error: error.message });
  }
});
router.post("/", upload.array("images", 10), async (req, res) => {
  try {
    const { title, description, category, author, publishedYear, quantity, available } = req.body;

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
      bookCodeDoc = await BookCode.create({
        category,
        prefix: "BC",
        lastNumber: 0
      });
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
      bookCode: bookCodeDoc._id
    });
    const populatedBook = await Book.findById(newBook._id)
      .populate("category", "name")
      .populate("author", "name");

    res.status(201).json({ 
      message: "✅ Thêm sách thành công", 
      book: populatedBook
    });
  } catch (err) {
    console.error("Lỗi khi tạo sách:", err);
    res.status(500).json({ 
      message: "Lỗi khi tạo sách mới",
      error: err.message
    });
  }
});

router.put("/:id", upload.array("images", 10), async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Files:", req.files);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID sách không hợp lệ" });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Không tìm thấy sách" });
    }
    let images = [...book.images];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => 
        `${req.protocol}://${req.get("host")}/uploads/books/${file.filename}`
      );
    } else if (req.body.images) {
      try {
        const parsedImages = typeof req.body.images === 'string' 
          ? JSON.parse(req.body.images)
          : req.body.images;
        images = Array.isArray(parsedImages) ? parsedImages : [parsedImages];
      } catch (err) {
        console.error("Error parsing images:", err);
        images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      }
    }
    const updates = {
      title: req.body.title || book.title,
      description: req.body.description || book.description,
      category: req.body.category || book.category,
      author: req.body.author || book.author,
      publishedYear: req.body.publishedYear ? Number(req.body.publishedYear) : book.publishedYear,
      quantity: req.body.quantity !== undefined ? Number(req.body.quantity) : book.quantity,
      available: req.body.available !== undefined ? Number(req.body.available) : book.available,
      images: images
    };
    const result = await Book.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).populate("category", "name")
      .populate("author", "name");

    res.json({ 
      message: "✅ Cập nhật sách thành công",
      book: result
    });
  } catch (err) {
    console.error("Lỗi cập nhật sách:", err);
    res.status(500).json({ message: "Cập nhật thất bại", error: err.message });
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
    console.error("Lỗi xóa sách:", error);
    res.status(500).json({ message: "Xóa thất bại", error: error.message });
  }
});
router.put("/borrow/:id", async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID sách không hợp lệ" });
    }

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Không tìm thấy sách" });

    const borrowQty = Number(quantity) > 0 ? Number(quantity) : 1;

    if (book.available < borrowQty) {
      return res.status(400).json({
        message: `❌ Không đủ sách để mượn. Hiện chỉ còn ${book.available} quyển.`,
      });
    }

    book.available -= borrowQty;
    await book.save();

    res.json({
      message: `✅ Mượn thành công ${borrowQty} quyển. Còn lại: ${book.available}/${book.quantity}`,
      book,
    });
  } catch (error) {
    console.error("Lỗi khi mượn sách:", error);
    res.status(500).json({ message: "Lỗi server khi mượn sách", error: error.message });
  }
});
router.put("/return/:id", async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID sách không hợp lệ" });
    }

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Không tìm thấy sách để trả" });

    const returnQty = Number(quantity) > 0 ? Number(quantity) : 1;

    book.available += returnQty;
    if (book.available > book.quantity) {
      book.available = book.quantity;
    }

    await book.save();
    res.json({
      message: `✅ Đã trả ${returnQty} quyển. Còn lại: ${book.available}/${book.quantity}`,
      book,
    });
  } catch (error) {
    console.error("Lỗi khi trả sách:", error);
    res.status(500).json({ message: "Trả sách thất bại", error: error.message });
  }
});
export default router;
