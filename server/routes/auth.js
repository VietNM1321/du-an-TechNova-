import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

/* ============================================================
   1️⃣  ĐĂNG KÝ
   ============================================================ */
router.post("/register", async (req, res) => {
  try {
    const { studentCode, email } = req.body;

    if (!studentCode || !email)
      return res.status(400).json({ message: "Vui lòng nhập đủ thông tin" });

    const existUser = await User.findOne({
      $or: [{ studentCode }, { email }],
    });
    if (existUser)
      return res
        .status(400)
        .json({ message: "Mã sinh viên hoặc email đã tồn tại!" });

    const newUser = await User.create({
      studentCode,
      email,
      role: "student",
    });

    res.status(201).json({
      message: "Đăng ký thành công. Kiểm tra email để biết mật khẩu",
      user: newUser,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   2️⃣  ADMIN CẤP MẬT KHẨU
   ============================================================ */
router.put("/setpassword/:id", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Vui lòng nhập mật khẩu!" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Không tìm thấy sinh viên!" });

    res.json({ message: "✅ Đặt mật khẩu thành công", user: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   3️⃣  ĐĂNG NHẬP
   ============================================================ */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy tài khoản!" });

    if (!user.active)
      return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa!" });

    if (!user.password)
      return res.status(400).json({ message: "Tài khoản chưa có mật khẩu, liên hệ admin!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Sai mật khẩu!" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "3d" }
    );

    res.json({
      message: "Đăng nhập thành công!",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        studentCode: user.studentCode,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   4️⃣  ĐỔI MẬT KHẨU
   ============================================================ */
router.put("/change-password/:id", async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng!" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Mật khẩu cũ không đúng!" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.passwordChangedAt = new Date();
    await user.save();

    res.json({ message: "Đổi mật khẩu thành công!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   5️⃣  QUÊN MẬT KHẨU
   ============================================================ */
router.post("/forgot-password", async (req, res) => {
  try {
    const { studentCode, email, newPassword } = req.body;

    if (!studentCode || !email || !newPassword)
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đủ mã sinh viên, email và mật khẩu mới" });

    const user = await User.findOne({ studentCode, email });
    if (!user)
      return res
        .status(404)
        .json({ message: "Không tìm thấy sinh viên với thông tin này" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.passwordChangedAt = new Date();
    await user.save();

    res.json({
      message: "Cấp lại mật khẩu thành công! Vui lòng kiểm tra gmail",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   6️⃣  LẤY DANH SÁCH SINH VIÊN (ĐỂ ADMIN CẤP MẬT KHẨU)
   ============================================================ */
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("_id studentCode email role");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
