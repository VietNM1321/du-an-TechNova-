import express from "express";
import History from "../models/history.js";

const router = express.Router();

/* 📌 Lấy toàn bộ lịch sử mượn trả (cho admin) */
router.get("/", async (req, res) => {
  try {
    const histories = await History.find().sort({ borrowDate: -1 });
    res.json(histories);
  } catch (err) {
    console.error("❌ Lỗi lấy lịch sử:", err);
    res.status(500).json({ message: "Lỗi server khi lấy lịch sử mượn trả" });
  }
});

/* 📌 Lấy lịch sử theo userId (cho người dùng) */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const histories = await History.find({ userId }).sort({ borrowDate: -1 });
    res.json(histories);
  } catch (err) {
    console.error("❌ Lỗi lấy lịch sử user:", err);
    res.status(500).json({ message: "Lỗi server khi lấy lịch sử người dùng" });
  }
});

/* 📌 Thêm lịch sử mượn (khi người dùng mượn sách) */
router.post("/", async (req, res) => {
  try {
    // In ra để kiểm tra dữ liệu frontend gửi về
    console.log("📦 Dữ liệu nhận từ frontend:", req.body);

    const {
      userId,
      fullName,
      studentId,
      email,
      bookId,
      bookTitle,
      quantity,
      borrowDate,
      returnDate,
      status,
    } = req.body;

    // Kiểm tra bắt buộc
    if (!bookId || !bookTitle) {
      return res.status(400).json({ message: "Thiếu thông tin sách!" });
    }

    const newHistory = new History({
      userId: req.body.userId || req.user?._id || "unknown_user",
      fullName: req.body.fullName,
      studentId: req.body.studentId,
      email: req.body.email,
      bookId: req.body.bookId,
      bookTitle: req.body.bookTitle,
      quantity: req.body.quantity,
      borrowDate: new Date(),
      returnDate: null,
      status: "Đang mượn",
    });
    

    const saved = await newHistory.save();
    console.log("✅ Lưu thành công:", saved);
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Lỗi thêm lịch sử:", err);
    res.status(500).json({
      message: "Không thể lưu lịch sử mượn",
      error: err.message,
    });
  }
});

/* 📌 Cập nhật trạng thái (trả sách) */
// Cập nhật ngày trả và trạng thái
router.put("/:id/return", async (req, res) => {
  try {
    const updated = await History.findByIdAndUpdate(
      req.params.id,
      { 
        returnDate: new Date(),
        status: "Đã trả",
      },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật lịch sử", error: err });
  }
});


export default router;
