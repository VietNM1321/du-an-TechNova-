import express from "express";
import Borrowing from "../models/borrowings.js";
import Book from "../models/books.js";
import User from "../models/User.js";

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