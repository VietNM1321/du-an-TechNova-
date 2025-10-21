import express from "express";
import User from "../models/User.js";
import Borrowings from "../models/borrowings.js";

const router = express.Router();

/* ============================================================
   🟢 LẤY DANH SÁCH NGƯỜI DÙNG
   ============================================================ */
router.get("/", async (req, res) => {
  try {
    const users = await User.find()
      .select("studentCode name email active role createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách người dùng thành công",
      users,
    });
  } catch (error) {
    console.error("❌ Lỗi lấy danh sách người dùng:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

/* ============================================================
   🔒 KHÓA / MỞ KHÓA TÀI KHOẢN
   ============================================================ */
router.put("/:id/toggle-active", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });

    user.active = !user.active;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Tài khoản đã ${user.active ? "mở khóa" : "bị khóa"}`,
      user,
    });
  } catch (error) {
    console.error("❌ Lỗi cập nhật trạng thái:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

/* ============================================================
   🧾 LẤY HỒ SƠ NGƯỜI DÙNG + DANH SÁCH SÁCH ĐÃ MƯỢN
   ============================================================ */
router.get("/:userId/profile", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("studentCode email role");
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng!" });

    const borrowings = await Borrowings.find({ user: user._id })
      .populate("book", "title author")
      .sort({ borrowDate: -1 });

    res.json({ user, borrowings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   📘 GỬI BÁO CÁO MẤT / HỎNG
   ============================================================ */
router.post("/:borrowingId/report", async (req, res) => {
  try {
    const { type, reason } = req.body;

    const borrowing = await Borrowings.findById(req.params.borrowingId);
    if (!borrowing)
      return res.status(404).json({ message: "Không tìm thấy bản ghi mượn!" });

    borrowing.status = type === "lost" ? "lost" : "damaged";
    borrowing.reportReason = reason;
    borrowing.returnDate = new Date();

    await borrowing.save();
    res.json({ message: "Đã gửi báo cáo thành công!", borrowing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;