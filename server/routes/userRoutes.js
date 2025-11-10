import express from "express";
import User from "../models/User.js";
import Borrowings from "../models/borrowings.js";

const router = express.Router();

/* ============================================================
   🟢 LẤY DANH SÁCH NGƯỜI DÙNG (có tìm kiếm/bộ lọc/phân trang)
   ============================================================ */
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { q, role, active, dateFrom, dateTo, sort, order } = req.query;
    const filter = {};

    if (q && q.trim()) {
      const text = q.trim();
      filter.$or = [
        { fullName: { $regex: text, $options: "i" } },
        { email: { $regex: text, $options: "i" } },
        { studentCode: { $regex: text, $options: "i" } },
        { phone: { $regex: text, $options: "i" } },
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (active === "true" || active === "false") {
      filter.active = active === "true";
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const total = await User.countDocuments(filter);
    const sortSpec =
      sort
        ? { [sort]: (order || "desc").toLowerCase() === "asc" ? 1 : -1 }
        : { createdAt: -1 };

    const users = await User.find(filter)
      .select("studentCode fullName email active role createdAt")
      .sort(sortSpec)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: "Lấy danh sách người dùng thành công",
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
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
// Thêm vào routes/user.js (sau các route hiện tại)
router.get("/code/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const user = await User.findOne({ studentCode: code }).select("_id studentCode fullName email");
    if (!user) return res.status(404).json({ message: "Không tìm thấy sinh viên" });
    res.json(user);
  } catch (error) {
    console.error("❌ Lỗi tìm sinh viên theo mã:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;