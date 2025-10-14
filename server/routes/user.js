import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

// 🧩 Middleware xác thực token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Không có token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};

// 🧩 Middleware kiểm tra quyền admin
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Chỉ admin mới được phép!" });
  next();
};

//
// ==================== CÁC API ====================
//

// 📋 1️⃣ Lấy danh sách sinh viên
router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password");
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔒 2️⃣ Khóa / Mở khóa tài khoản sinh viên
router.put("/toggle/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy sinh viên" });

    user.active = !user.active;
    await user.save();

    res.status(200).json({
      message: user.active
        ? "✅ Đã mở khóa tài khoản sinh viên"
        : "🔒 Đã khóa tài khoản sinh viên",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔑 3️⃣ Admin cấp mật khẩu cho sinh viên
router.put("/set-password/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Vui lòng nhập mật khẩu" });

    const hashed = await bcrypt.hash(password, 10);

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { password: hashed },
      { new: true }
    ).select("-password");

    if (!updated)
      return res.status(404).json({ message: "Không tìm thấy sinh viên" });

    res.status(200).json({
      message: "✅ Cấp mật khẩu thành công!",
      user: updated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
