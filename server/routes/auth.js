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
      return res.status(400).json({ message: "Vui lòng nhập đủ thông tin!" });

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
      message: "Đăng ký thành công. Kiểm tra email để biết mật khẩu!",
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
    if (!password)
      return res.status(400).json({ message: "Vui lòng nhập mật khẩu!" });

    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy sinh viên!" });

    if (user.password)
      return res.status(400).json({
        message: "Tài khoản đã có mật khẩu!",
      });

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "✅ Cấp mật khẩu thành công", user });
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

    // ADMIN cố định
    if (
      (email === "admin" || email === "admin@gmail.com") &&
      password === "123456789"
    ) {
      const token = jwt.sign({ id: "admin", role: "admin" }, "secret", {
        expiresIn: "3d",
      });

      return res.json({
        message: "Đăng nhập admin thành công!",
        token,
        user: {
          _id: "admin",
          email: "admin@gmail.com",
          role: "admin",
          studentCode: "ADMIN",
        },
      });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy tài khoản!" });

    if (!user.password)
      return res
        .status(400)
        .json({ message: "Tài khoản chưa được cấp mật khẩu!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu!" });

    const token = jwt.sign({ id: user._id, role: user.role }, "secret", {
      expiresIn: "3d",
    });

    res.json({
      message: "Đăng nhập thành công!",
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   4️⃣  LẤY DANH SÁCH USER
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
