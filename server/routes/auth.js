// routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();
const router = express.Router();

/* ============================================================
   0️⃣ TẠO ADMIN MẶC ĐỊNH (nếu chưa có)
   ============================================================ */
const createDefaultAdmin = async () => {
  try {
    const email = "admin@gmail.com";
    const existingAdmin = await User.findOne({ email });
    if (!existingAdmin) {
      const admin = new User({
        studentCode: "ADMIN001",
        email,
        fullName: "Admin ",
        course: "Admin",
        role: "admin",
        active: true,
        password: "123456789", 
      });
      await admin.save();
      console.log("✅ Admin mặc định đã được tạo: admin@gmail.com / 123456789");
    } else {
      console.log("⚠️ Admin mặc định đã tồn tại");
    }
  } catch (err) {
    console.error("❌ Lỗi tạo admin mặc định:", err);
  }
};
createDefaultAdmin();

/* ============================================================
   1️⃣ ĐĂNG KÝ SINH VIÊN
   ============================================================ */
router.post("/register", async (req, res) => {
  try {
    const { studentCode, email, fullName, course } = req.body;
    if (!studentCode || !email || !fullName || !course)
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email đã được đăng ký!" });

    const newUser = new User({
      studentCode,
      email,
      fullName,
      course,
      role: "student",
      active: true,
      password: "", // admin sẽ cấp sau
    });

    await newUser.save();
    res.status(201).json({ message: "Đăng ký thành công!" });
  } catch (error) {
    console.error("❌ Lỗi đăng ký:", error);
    res.status(500).json({ message: "Lỗi server khi đăng ký!" });
  }
});

/* ============================================================
   2️⃣ CẤP/ĐỔI MẬT KHẨU (ADMIN) - KHÔNG MÃ HÓA, KHÔNG CHO SINH VIÊN BỊ KHÓA
   ============================================================ */
router.put("/setpassword/:id", async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password) return res.status(400).json({ message: "Thiếu mật khẩu!" });

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng!" });

    if (!user.active) {
      return res.status(403).json({ message: "Sinh viên đã bị khóa, không thể cấp mật khẩu!" });
    }

    user.password = password; // không mã hóa
    await user.save();

    // Gửi email thông báo
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Mật khẩu đăng nhập hệ thống TechNova 📚",
      html: `
        <h3>Xin chào ${user.fullName} 👋</h3>
        <p>Bạn đã được cấp mật khẩu để đăng nhập hệ thống sinh viên.</p>
        <p><b>Email:</b> ${user.email}</p>
        <p><b>Mật khẩu:</b> ${password}</p>
        <p>Hãy đăng nhập và đổi mật khẩu sau khi truy cập lần đầu.</p>
        <br/>
        <p>Trân trọng,<br/>Đội ngũ TechNova</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`📧 Đã gửi email tới ${user.email}`);
    } catch (mailError) {
      console.error("⚠️ Lỗi gửi email:", mailError);
    }

    res.json({ message: "Cấp mật khẩu và gửi email thành công!" });
  } catch (err) {
    console.error("❌ Lỗi khi cấp mật khẩu:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
});

/* ============================================================
   3️⃣ LẤY DANH SÁCH SINH VIÊN (ADMIN)
   ============================================================ */
router.get("/users", async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select(
      "studentCode fullName email course active password"
    );
    res.json(students);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách sinh viên:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách sinh viên!" });
  }
});

/* ============================================================
   4️⃣ ĐĂNG NHẬP
   ============================================================ */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Vui lòng nhập đủ email và mật khẩu!" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng!" });

    if (user.password !== password)
      return res.status(400).json({ message: "Sai mật khẩu!" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      message: "Đăng nhập thành công!",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error("❌ Lỗi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi server khi đăng nhập!" });
  }
});

export default router;
