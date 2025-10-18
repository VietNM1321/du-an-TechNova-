import express from "express";
import User from "../models/User.js";

const router = express.Router();

/* ============================================================
   🟢 LẤY DANH SÁCH NGƯỜI DÙNG
   ============================================================ */
router.get("/", async (req, res) => {
  try {
    // Lấy danh sách user, sắp xếp theo thời gian tạo mới nhất
    const users = await User.find()
      .select("studentCode email password active role createdAt")
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
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });

    // Đảo trạng thái active
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

export default router;
