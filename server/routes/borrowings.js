import express from "express";
import Borrowing from "../models/borrowings.js";
import Book from "../models/books.js";
import User from "../models/User.js";
import multer from "multer";

const router = express.Router();
const sseClients = [];

function sendSseEvent(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((res) => res.write(payload));
}

// ===== Multer setup upload ảnh =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const upload = multer({ storage });

// ===== Create borrowings =====
router.post("/", async (req, res) => {
  try {
    const { items, userId } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ message: "Danh sách sách mượn trống!" });

    let user = null;
    if (userId && /^[0-9a-fA-F]{24}$/.test(userId)) {
      user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng!" });
    } else {
      const anonUser = await User.findOne({ email: "anon@example.com" });
      user = anonUser || (await User.create({ fullName: "Khách vãng lai", email: "anon@example.com" }));
    }

    const created = [];
    for (const item of items) {
      const book = await Book.findById(item.bookId);
      if (!book || (book.available ?? book.quantity) < item.quantity) continue;

      book.available = (book.available ?? book.quantity) - item.quantity;
      await book.save();

      const borrowing = await Borrowing.create({
        user: user._id,
        book: book._id,
        quantity: item.quantity,
        borrowDate: item.borrowDate || new Date(),
        returnDate: item.returnDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: "borrowed",
        bookSnapshot: {
          title: book.title,
          images: book.images,
          description: book.description,
        },
        userSnapshot: {
          name: user.fullName,
          email: user.email,
        },
      });

      created.push(borrowing);
    }

    if (created.length === 0) return res.status(400).json({ message: "Không tạo được đơn mượn nào." });
    sendSseEvent({ type: "new_borrowings", payload: created });
    res.status(201).json(created);
  } catch (err) {
    console.error("❌ Borrow error:", err);
    res.status(500).json({ message: "Lỗi server khi tạo đơn mượn!" });
  }
});

// ===== SSE for admin =====
router.get("/stream", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders?.();
  res.write(":ok\n\n");
  sseClients.push(res);
  req.on("close", () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// ===== Return book =====
router.put("/:id/return", async (req, res) => {
  try {
    const borrowing = await Borrowing.findById(req.params.id);
    if (!borrowing) return res.status(404).json({ message: "Không tìm thấy đơn mượn!" });
    if (borrowing.status === "returned") return res.status(400).json({ message: "Đã trả rồi" });

    borrowing.status = "returned";
    borrowing.returnDate = new Date();
    await borrowing.save();

    const book = await Book.findById(borrowing.book);
    if (book) {
      book.available = (book.available ?? 0) + borrowing.quantity;
      await book.save();
    }
    res.json(borrowing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi cập nhật trạng thái trả sách" });
  }
});

// ===== Report lost =====
router.put("/:id/report-lost", async (req, res) => {
  try {
    const borrowing = await Borrowing.findByIdAndUpdate(
      req.params.id,
      { status: "damaged", damageType: "lost" },
      { new: true }
    );
    if (!borrowing) return res.status(404).json({ message: "Không tìm thấy đơn mượn!" });
    res.json({ message: "✅ Đã báo mất!", borrowing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi báo mất!" });
  }
});

// ===== Report broken =====
router.put("/:id/report-broken", upload.single("image"), async (req, res) => {
  try {
    const { reason } = req.body;
    const image = req.file ? req.file.path : null;
    const borrowing = await Borrowing.findByIdAndUpdate(
      req.params.id,
      { status: "damaged", damageType: "broken", damageReason: reason, damageImage: image },
      { new: true }
    );
    if (!borrowing) return res.status(404).json({ message: "Không tìm thấy đơn mượn!" });
    res.json({ message: "✅ Đã báo hỏng!", borrowing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi báo hỏng!" });
  }
});

export default router;
