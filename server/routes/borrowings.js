import express from "express";
import Borrowing from "../models/borrowings.js";
import Book from "../models/books.js";
import User from "../models/User.js";
import multer from "multer";
import { verifyToken, isSelfOrAdmin, requireRole } from "../middleware/auth.js";

const router = express.Router();

// ==================== Multer setup ====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const upload = multer({ storage });

const STATUS_ENUM = {
  BORROWED: "borrowed",
  RETURNED: "returned",
  DAMAGED: "damaged",
  LOST: "lost",
  OVERDUE: "overdue",
  COMPENSATED: "compensated",
};

// ==================== Tạo đơn mượn ====================
router.post("/", verifyToken, async (req, res) => {
  try {
    const { items } = req.body;
    if (!items?.length) {
      return res.status(400).json({ message: "Danh sách sách mượn trống!" });
    }

    const user = await User.findById(req.user.id).lean();
    const borrowings = await Promise.all(
      items.map(async (item) => {
        const book = await Book.findById(item.bookId)
          .populate("author", "name")
          .lean();

        // ✅ Tạo snapshot an toàn — không bao giờ null
        const userSnapshot = user
          ? {
              fullName: user.fullName || "Khách vãng lai",
              studentId: user.studentCode || "",
              course: user.course || "",
              email: user.email || "",
            }
          : {
              fullName: "Khách vãng lai",
              studentId: "",
              course: "",
              email: "",
            };

        const bookSnapshot = book
          ? {
              title: book.title || "Không rõ",
              author:
                (typeof book.author === "string" ? book.author : book.author?.name) ||
                "Không rõ",
              isbn: book.code || "N/A",
            }
          : {
              title: "Không rõ",
              author: "Không rõ",
              isbn: "N/A",
            };

        return {
          user: user?._id,
          book: book?._id,
          borrowDate: item.borrowDate || new Date(),
          dueDate:
            item.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          quantity: item.quantity || 1,
          status: STATUS_ENUM.BORROWED,
          userSnapshot,
          bookSnapshot,
        };
      })
    );

    const saved = await Borrowing.insertMany(borrowings);
    res.status(201).json({
      message: "✅ Tạo đơn mượn thành công!",
      borrowings: saved,
    });
  } catch (error) {
    console.error("❌ Borrow error:", error);
    res
      .status(500)
      .json({ message: "Lỗi server khi tạo đơn mượn!", error: error.message });
  }
});

// ==================== Lấy danh sách đơn mượn ====================
router.get("/", verifyToken, async (req, res) => {
  try {
    const borrowings = await Borrowing.find()
      .sort({ borrowDate: -1 })
      .populate({ path: "book", populate: { path: "author", select: "name" } })
      .populate("user");

    const now = new Date();
    const updated = borrowings.map((b) => {
      let status = b.status;
      if (status === STATUS_ENUM.BORROWED && new Date(b.dueDate) < now)
        status = STATUS_ENUM.OVERDUE;
      return { ...b._doc, status };
    });

    res.json(updated);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách borrowings:", err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách mượn sách!" });
  }
});

// ==================== Lịch sử mượn theo user ====================
router.get("/history/:userId", verifyToken, isSelfOrAdmin("userId"), async (req, res) => {
  try {
    const { userId } = req.params;
    const filter = /^[0-9a-fA-F]{24}$/.test(userId) ? { user: userId } : {};

    let borrowings = await Borrowing.find(filter)
      .sort({ borrowDate: -1 })
      .populate({ path: "book", populate: { path: "author", select: "name" } })
      .populate("user");

    const now = new Date();
    borrowings = borrowings.map((b) => {
      let status = b.status;
      if (status === STATUS_ENUM.BORROWED && new Date(b.dueDate) < now)
        status = STATUS_ENUM.OVERDUE;
      return { ...b._doc, status };
    });

    res.json(borrowings);
  } catch (error) {
    console.error("❌ Lỗi lấy lịch sử:", error);
    res.status(500).json({ message: "Lỗi server khi lấy lịch sử mượn!" });
  }
});

// ==================== Báo hỏng ====================
router.put("/:id/report-broken", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const { reason } = req.body;
    const image = req.file ? req.file.path : null;

    const borrowing = await Borrowing.findByIdAndUpdate(
      req.params.id,
      {
        status: STATUS_ENUM.DAMAGED,
        damageType: "broken",
        damageReason: reason || "Không ghi rõ",
        damageImage: image,
      },
      { new: true }
    );

    if (!borrowing)
      return res.status(404).json({ message: "Không tìm thấy đơn mượn!" });
    res.json({ message: "✅ Đã báo hỏng!", borrowing });
  } catch (error) {
    console.error("❌ Lỗi báo hỏng:", error);
    res.status(500).json({ message: "Lỗi server khi báo hỏng!" });
  }
});

// ==================== Báo mất ====================
router.put("/:id/report-lost", verifyToken, async (req, res) => {
  try {
    const borrowing = await Borrowing.findByIdAndUpdate(
      req.params.id,
      { status: STATUS_ENUM.LOST, damageType: "lost" },
      { new: true }
    );
    if (!borrowing)
      return res.status(404).json({ message: "Không tìm thấy đơn mượn!" });
    res.json({ message: "✅ Đã báo mất!", borrowing });
  } catch (error) {
    console.error("❌ Lỗi báo mất:", error);
    res.status(500).json({ message: "Lỗi server khi báo mất!" });
  }
});

// ==================== Nhập tiền đền ====================
router.put("/:id/compensation", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { compensationAmount } = req.body;

    const borrowing = await Borrowing.findByIdAndUpdate(
      req.params.id,
      {
        compensationAmount,
        status: STATUS_ENUM.COMPENSATED,
      },
      { new: true }
    );

    if (!borrowing)
      return res.status(404).json({ message: "Không tìm thấy đơn mượn!" });
    res.json({ message: "💰 Đã cập nhật tiền đền!", borrowing });
  } catch (error) {
    console.error("❌ Lỗi cập nhật tiền đền:", error);
    res.status(500).json({ message: "Lỗi server khi nhập tiền đền!" });
  }
});

// ==================== Xác nhận trả sách ====================
router.put("/:id/return", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const borrowing = await Borrowing.findByIdAndUpdate(
      req.params.id,
      { status: STATUS_ENUM.RETURNED, returnDate: new Date() },
      { new: true }
    );
    if (!borrowing)
      return res.status(404).json({ message: "Không tìm thấy đơn mượn!" });
    res.json({ message: "✅ Xác nhận trả thành công!", borrowing });
  } catch (error) {
    console.error("❌ Lỗi xác nhận trả:", error);
    res.status(500).json({ message: "Lỗi server khi xác nhận trả sách!" });
  }
});

export default router;
