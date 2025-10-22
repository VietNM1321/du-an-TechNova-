import express from "express";
import Author from "../models/author.js";
import Book from "../models/books.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();
const storage = multer.diskStorage({ // cái này là file liên kết đến thư viện upload lấy ảnh
  destination: function (req, file, cb) {
    cb(null, "uploads/authors/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const total = await Author.countDocuments();
    const authors = await Author.find().skip(skip).limit(limit);

    res.json({
      authors,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ message: "Không tìm thấy tác giả" });
    }
    res.json(author);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
});
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, bio, dateOfBirth, dateOfDeath } = req.body;
    const author = new Author({
      name,
      bio,
      dateOfBirth,
      dateOfDeath,
      image: req.file ? req.file.path : null,
    });
    await author.save();
    res.status(201).json(author);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi thêm tác giả", error });
  }
});

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, bio, dateOfBirth, dateOfDeath } = req.body;
    const updateData = { name, bio, dateOfBirth, dateOfDeath };
    if (req.file) updateData.image = req.file.path;

    const updated = await Author.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!updated) return res.status(404).json({ message: "Không tìm thấy tác giả" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật tác giả", error });
  }
});
export const deleteAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    const author = await Author.findById(id);
    if (!author) {
      return res.status(404).json({ message: "❌ Không tìm thấy tác giả!" });
    }
    const relatedBooks = await Book.find({ author: id });
    console.log("📚 Số sách tìm được:", relatedBooks.length);

    if (relatedBooks.length > 0) {
      return res.status(400).json({
        message: `❌ Không thể xóa! Tác giả này đang có ${relatedBooks.length} sách.`,
      });
    }
    if (author.image && fs.existsSync(author.image)) {
      fs.unlinkSync(author.image);
    }
    await Author.findByIdAndDelete(id);
    res.json({ message: "✅ Xóa tác giả thành công!" });
  } catch (err) {
    console.error("❌ Lỗi khi xóa tác giả:", err);
    res.status(500).json({ message: "⚠️ Lỗi máy chủ khi xóa tác giả!" });
  }
};
router.delete("/:id", deleteAuthor);

export default router;