import express from "express";
import User from "../models/User.js";
import Borrowings from "../models/borrowings.js";
import { verifyToken } from "../middleware/auth.js";


const router = express.Router();
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("studentCode fullName email role active createdAt")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng!" });
    }

    const borrowings = await Borrowings.find({ user: req.user.id })
      .populate("book", "title author image")
      .sort({ borrowDate: -1 });

    res.status(200).json({
      success: true,
      message: "Lấy hồ sơ người dùng thành công!",
      user,
      borrowings,
    });
  } catch (err) {
    console.error("❌ Lỗi khi lấy hồ sơ:", err);
    res.status(500).json({ message: "Lỗi server khi lấy hồ sơ người dùng!" });
  }
});

/* ============================================================
   🟢 LẤY DANH SÁCH NGƯỜI DÙNG (có tìm kiếm/bộ lọc/phân trang)
   ============================================================ */
/* ============================================================
   🟢 LẤY DANH SÁCH NGƯỜI DÙNG (có tìm kiếm/bộ lọc/phân trang, date-safe)
   ============================================================ */
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { q, role, active, dateFrom, dateTo, sort, order } = req.query;
    const filter = {};

    // Search
    if (q && q.trim()) {
      const text = q.trim();
      filter.$or = [
        { fullName: { $regex: text, $options: "i" } },
        { email: { $regex: text, $options: "i" } },
        { studentCode: { $regex: text, $options: "i" } },
        { phone: { $regex: text, $options: "i" } },
      ];
    }

    // Role filter
    if (role) filter.role = role;

    // Active filter
    if (active === "true") filter.active = true;
    else if (active === "false") filter.active = false;

    // Date filter (safe)
    if (dateFrom || dateTo) {
      const gte = dateFrom ? new Date(dateFrom) : null;
      const lte = dateTo ? new Date(dateTo) : null;

      filter.createdAt = {};
      if (gte instanceof Date && !isNaN(gte)) filter.createdAt.$gte = gte;
      if (lte instanceof Date && !isNaN(lte)) filter.createdAt.$lte = lte;

      if (Object.keys(filter.createdAt).length === 0) delete filter.createdAt;
    }

    const total = await User.countDocuments(filter);

    const sortSpec = sort
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
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách người dùng:", err);
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
// 🧑‍💻 Lấy hồ sơ người dùng hiện tại bằng token


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
// Sinh viên gửi yêu cầu quên mật khẩu
router.post("/forgot-password", async (req, res) => {
  const { studentCode, email } = req.body;
  const user = await User.findOne({ studentCode });
  if (!user) return res.status(404).json({ message: "Sinh viên không tồn tại" });
  if (user.email !== email) return res.status(400).json({ message: "Email không khớp" });

  user.forgotPassword = true;  // cập nhật trạng thái
  await user.save();

  res.json({ message: "✅ Yêu cầu đã được gửi thành công!" });
});

router.put("/:id/forgotPassword", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

    user.forgotPassword = false; // reset trạng thái quên mật khẩu
    await user.save();

    res.json({ message: "✅ Đã xác nhận cấp mật khẩu, trạng thái quên mật khẩu đã reset" });
  } catch (err) {
    console.error("❌ Lỗi reset trạng thái quên mật khẩu:", err);
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