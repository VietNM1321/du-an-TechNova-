import express from "express";
import Borrowing from "../models/borrowings.js";
import Book from "../models/books.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const list = await Borrowing.find()
      .populate("user book")
      .sort({ borrowDate: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi tải danh sách mượn sách!" });
  }
});

router.post("/", async (req, res) => {
  try {
    console.log("POST /api/borrowings body:", req.body);
    const { borrowings, userId } = req.body;
    if (!borrowings || borrowings.length === 0)
      return res.status(400).json({ message: "Không có dữ liệu mượn!" });
    let user;
    if (!userId || userId === "anon") {
      const guestEmail = "guest@local";
      user = await User.findOne({ email: guestEmail });
      if (!user) {
        user = await User.create({ fullName: "Khách", email: guestEmail });
      }
    } else {
      const mongoose = (await import("mongoose")).default;
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid userId" });
      }
      user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng!" });
    }

    const created = [];

    for (const b of borrowings) {
      try {
        const book = await Book.findById(b.book).populate("author publisher category");
        if (!book) {
          console.warn("Book not found for id", b.book);
          continue;
        }

        if (book.available < b.quantity)
          return res.status(400).json({ message: `Sách ${book.title} không đủ số lượng!` });

        book.available -= b.quantity;
        await book.save();

        const borrow = await Borrowing.create({
          user: user._id,
          book: book._id,
          quantity: b.quantity,
          dueDate: b.dueDate,
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
            name: user.name,
            email: user.email,
            phone: user.phone,
            adresses: user.adresses,
          },
        });

        created.push(borrow);
      } catch (innerErr) {
        console.error("Error processing borrowing item:", innerErr, "item:", b);
        continue;
      }
    }

    return res.json({ message: "✅ Mượn sách thành công!", borrowings: created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Lỗi khi mượn sách!" });
  }
});

router.put("/:id/return", async (req, res) => {
  try {
    const borrow = await Borrowing.findById(req.params.id).populate("book");
    if (!borrow)
      return res.status(404).json({ message: "Không tìm thấy phiếu mượn!" });

    if (borrow.status === "returned")
      return res.status(400).json({ message: "Sách này đã được trả rồi!" });

    const book = await Book.findById(borrow.book._id);
    if (book) {
      book.available += borrow.quantity;
      await book.save();
    }

    borrow.status = "returned";
    borrow.returnDate = new Date();
    await borrow.save();

    res.json({ message: "✅ Trả sách thành công!", borrow });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Lỗi khi trả sách!" });
  }
});

export default router;