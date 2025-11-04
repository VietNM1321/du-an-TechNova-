import express from "express";
import Borrowing from "../models/borrowings.js";
import Book from "../models/books.js";
import User from "../models/User.js";
<<<<<<< HEAD
import multer from "multer";

const router = express.Router();

// ===== Multer setup upload ảnh =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const upload = multer({ storage });

// ===== Tạo đơn mượn sách =====
const STATUS_ENUM = {
  BORROWED: "borrowed",
  RETURNED: "returned",
  DAMAGED: "damaged",
};
router.post("/", async (req, res) => {
  try {
    const { userId, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Danh sách sách mượn trống!" });
    }

    let user = null;
    if (userId && /^[0-9a-fA-F]{24}$/.test(userId)) {
      user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng!" });
    } else {
      const anonUser = await User.findOne({ email: "anon@example.com" });
      user = anonUser || (await User.create({ fullName: "Khách vãng lai", email: "anon@example.com" }));
    }

    const borrowings = items.map((item) => ({
      book: item.bookId,
      user: user._id,
      borrowDate: item.borrowDate || new Date(),
      returnDate: item.returnDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: STATUS_ENUM.BORROWED,
    }));

    const saved = await Borrowing.insertMany(borrowings);
    res.status(201).json({ message: "Tạo đơn mượn thành công!", borrowings: saved });
  } catch (error) {
    console.error("❌ Borrow error:", error);
    res.status(500).json({ message: "Lỗi server khi tạo đơn mượn!", error: error.message });
  }
});

// ===== Lấy lịch sử =====
router.get("/history/:userId", async (req, res) => {
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
      if (status === STATUS_ENUM.BORROWED && new Date(b.returnDate) < now) status = "overdue";
      return { ...b._doc, status };
    });

    res.json(borrowings);
  } catch (error) {
    console.error("❌ Lỗi lấy lịch sử:", error);
    res.status(500).json({ message: "Lỗi server khi lấy lịch sử mượn!" });
  }
});

// ===== Báo mất =====
router.put("/:id/report-lost", async (req, res) => {
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

// ===== Báo hỏng =====
router.put("/:id/report-broken", upload.single("image"), async (req, res) => {
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
=======

const router = express.Router();
const sseClients = [];

function sendSseEvent(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((res) => res.write(payload));
}
router.get("/all", async (req, res) => {
  try {
    const list = await Borrowing.find().sort({ borrowDate: -1 });
    const now = new Date();
    await Promise.all(
      list.map(async (borrowing) => {
        if (borrowing.status === "borrowed" && new Date(borrowing.dueDate) < now) {
          borrowing.status = "overdue";
          await borrowing.save();
        }
      })
    );

    res.json(list);
  } catch (err) {
    console.error("Error fetching all borrowings:", err);
    res.status(500).json({ message: "Lỗi khi tải danh sách mượn sách!" });
  }
});

// Get borrowings for a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const borrowings = await Borrowing.find({ user: req.params.userId }).sort({ borrowDate: -1 });
    res.json(borrowings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi tải lịch sử mượn sách!" });
  }
});

// Create new borrowings (expects borrowings: [{ bookId, quantity, dueDate }], userId)
router.post("/", async (req, res) => {
  try {
    const { borrowings, userId } = req.body;

    if (!borrowings || !Array.isArray(borrowings) || borrowings.length === 0) {
      return res.status(400).json({ message: "Không có dữ liệu mượn!" });
    }

    let user = null;
    if (!userId) {
      // fallback to guest account if userId not provided
      const guestEmail = "guest@local";
      user = await User.findOne({ email: guestEmail });
      if (!user) {
        user = await User.create({ fullName: "Khách", email: guestEmail });
      }
    } else {
      user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng!" });
    }

    const created = [];

    for (const item of borrowings) {
      try {
        const book = await Book.findById(item.bookId).populate("author publisher category");
        if (!book) {
          console.warn("Book not found:", item.bookId);
          continue;
        }

        if ((book.available ?? book.available) < item.quantity) {
          return res.status(400).json({ message: `Sách "${book.title}" không đủ số lượng!` });
        }

        // decrement available
        book.available = (book.available || 0) - item.quantity;
        await book.save();

        const borrowing = await Borrowing.create({
          user: user._id,
          book: book._id,
          quantity: item.quantity,
          borrowDate: item.borrowDate ? new Date(item.borrowDate) : new Date(),
          dueDate: item.returnDate ? new Date(item.returnDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: "borrowed",
          cartData: {
            borrowDate: item.borrowDate,
            returnDate: item.returnDate
          },
          bookSnapshot: {
            title: book.title,
            images: book.images,
            description: book.description,
            author: { name: book.author?.name },
            publisher: { name: book.publisher?.name },
            category: { name: book.category?.name },
            quantity: book.quantity,
            available: book.available,
            publishedYear: book.publishedYear,
          },
          userSnapshot: {
            name: user.fullName,
            email: user.email,
            phone: user.phone || "",
            addresses: user.addresses || [],
          },
        });

        created.push(borrowing);
      } catch (innerErr) {
        console.error("Error processing item:", innerErr, item);
        continue;
      }
    }

    if (created.length === 0) return res.status(400).json({ message: "Không tạo được đơn mượn nào." });
    try {
      sendSseEvent({ type: 'new_borrowings', payload: created });
    } catch (e) {
      console.warn('SSE notify failed:', e);
    }

    res.status(201).json(created);
  } catch (err) {
    console.error("Error creating borrowings:", err);
    res.status(500).json({ message: "Lỗi khi tạo đơn mượn!" });
  }
});

// SSE endpoint: admin can open EventSource to receive live updates
router.get('/stream', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders?.();

  // send an initial comment to establish the stream
  res.write(':ok\n\n');

  sseClients.push(res);

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// Return book endpoint
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
      book.available = (book.available || 0) + borrowing.quantity;
      await book.save();
    }

    res.json(borrowing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi cập nhật trạng thái trả sách" });
  }
});

export default router;
>>>>>>> origin/main
