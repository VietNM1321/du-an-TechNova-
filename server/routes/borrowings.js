import express from "express";
import Borrowing from "../models/borrowings.js";
import Book from "../models/books.js";
import User from "../models/User.js";
import multer from "multer";
import { verifyToken, isSelfOrAdmin } from "../middleware/auth.js";

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const upload = multer({ storage });
const STATUS_ENUM = {
  BORROWED: "borrowed",
  RETURNED: "returned",
  DAMAGED: "damaged",
};
router.post("/", verifyToken, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Danh sách sách mượn trống!" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng!" });

    const borrowings = items.map((item) => ({
      book: item.bookId,
      user: user._id,
      borrowDate: item.borrowDate || new Date(),
      dueDate: item.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: STATUS_ENUM.BORROWED,
      quantity: item.quantity || 1,
    }));

    const saved = await Borrowing.insertMany(borrowings);
    res.status(201).json({ message: "Tạo đơn mượn thành công!", borrowings: saved });
  } catch (error) {
    console.error("❌ Borrow error:", error);
    res.status(500).json({ message: "Lỗi server khi tạo đơn mượn!", error: error.message });
  }
});
router.get("/", verifyToken, async (req, res) => {
  try {
    const borrowings = await Borrowing.find()
      .sort({ borrowDate: -1 })
      .populate("book")
      .populate("user");
    res.json(borrowings);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách borrowings:", err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách mượn sách!" });
  }
});
router.get("/history/:userId", verifyToken, isSelfOrAdmin("userId"), async (req, res) => {
  try {
    const { userId } = req.params;
    let filter = {};
    if (userId && /^[0-9a-fA-F]{24}$/.test(userId)) filter.user = userId;

    let borrowings = await Borrowing.find(filter)
      .sort({ borrowDate: -1 })
      .populate("book")
      .populate("user");

    borrowings = borrowings.map((b) => {
      let status = b.status;
      const now = new Date();
      if (status === STATUS_ENUM.BORROWED && new Date(b.dueDate) < now) status = "overdue";
      return { ...b._doc, status };
    });

    res.json(borrowings);
  } catch (error) {
    console.error("❌ Lỗi lấy lịch sử:", error);
    res.status(500).json({ message: "Lỗi server khi lấy lịch sử mượn!" });
  }
});
router.get("/stream", (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');

  const sendEvent = async () => {
    const borrowings = await Borrowing.find()
      .sort({ borrowDate: -1 })
      .populate("book")
      .populate("user");
    res.write(`data: ${JSON.stringify({ type: 'new_borrowings', borrowings })}\n\n`);
  };

  const interval = setInterval(sendEvent, 5000);

  req.on('close', () => {
    clearInterval(interval);
  });
});
router.put("/:id/report-lost", verifyToken, async (req, res) => {
  try {
    const borrowing = await Borrowing.findByIdAndUpdate(
      req.params.id,
      { status: STATUS_ENUM.DAMAGED, damageType: "lost" },
      { new: true }
    );
    if (!borrowing) return res.status(404).json({ message: "Không tìm thấy đơn mượn!" });
    res.json({ message: "✅ Đã báo mất!", borrowing });
  } catch (error) {
    console.error("❌ Lỗi báo mất:", error);
    res.status(500).json({ message: "Lỗi server khi báo mất!" });
  }
});
router.put("/:id/report-broken", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const { reason } = req.body;
    const image = req.file ? req.file.path : null;

    const borrowing = await Borrowing.findByIdAndUpdate(
      req.params.id,
      { status: STATUS_ENUM.DAMAGED, damageType: "broken", damageReason: reason, damageImage: image },
      { new: true }
    );
    if (!borrowing) return res.status(404).json({ message: "Không tìm thấy đơn mượn!" });
    res.json({ message: "✅ Đã báo hỏng!", borrowing });
  } catch (error) {
    console.error("❌ Lỗi báo hỏng:", error);
    res.status(500).json({ message: "Lỗi server khi báo hỏng!" });
  }
});

export default router;
