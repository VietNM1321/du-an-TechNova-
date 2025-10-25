import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Course from "../models/Course.js";

const router = express.Router();

/* ============================================================
   1️⃣  ĐĂNG KÝ (Register)
   ============================================================ */
router.post("/register", async (req, res) => {
  try {
    const { studentCode, email, courseId } = req.body;

    if (!studentCode || !email || !courseId) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
    }

    // ✅ Kiểm tra định dạng mã sinh viên
    const regex = /^PH\d{4}$/;
    if (!regex.test(studentCode)) {
      return res.status(400).json({
        message: "Mã sinh viên phải bắt đầu bằng 'PH' và theo sau là 4 chữ số!",
      });
    }

    // ✅ Tìm khóa học theo ID
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học!" });
    }

    // ✅ Kiểm tra phạm vi mã sinh viên
    const studentNumber = parseInt(studentCode.replace("PH", ""), 10);
    if (
      studentNumber < course.minStudentCode ||
      studentNumber > course.maxStudentCode
    ) {
      return res.status(400).json({
        message: "❌ Mã sinh viên không nằm trong khoảng của khóa học!",
      });
    }

    // ✅ Kiểm tra trùng email hoặc mã sinh viên
    const existUser = await User.findOne({
      $or: [{ studentCode }, { email }],
    });
    if (existUser) {
      return res
        .status(400)
        .json({ message: "Mã sinh viên hoặc email đã tồn tại!" });
    }

    // ✅ Tạo mật khẩu mặc định
    const defaultPassword = "123456";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // ✅ Tạo user mới
    const newUser = await User.create({
      studentCode,
      fullName: "Chưa cập nhật",
      course: course.courseName,
      email,
      password: hashedPassword,
      role: "student",
    });

    // ✅ Thêm sinh viên vào danh sách trong khóa học
    course.students.push({
      studentCode,
      fullName: newUser.fullName,
    });
    await course.save();

    res.status(201).json({
      message: "🎉 Đăng ký thành công!",
      user: newUser,
    });
  } catch (err) {
    console.error("❌ Lỗi đăng ký:", err);
    res.status(500).json({ message: "Lỗi server khi đăng ký!" });
  }
});

/* ============================================================
   2️⃣  ĐĂNG NHẬP (Login)
   ============================================================ */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Kiểm tra thông tin
    if (!email || !password) {
      return res.status(400).json({ message: "Thiếu email hoặc mật khẩu" });
    }

    // ✅ Tìm user theo email
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    // ✅ So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Mật khẩu không đúng" });

    // ✅ Tạo token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Đăng nhập thành công ✅",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        course: user.course,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Lỗi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi server khi đăng nhập" });
  }
});

/* ============================================================
   3️⃣  LẤY THÔNG TIN NGƯỜI DÙNG (Profile)
   ============================================================ */
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy thông tin người dùng" });
  }
});
/* ============================================================
   4️⃣  LẤY DANH SÁCH SINH VIÊN (CHO ADMIN)
   ============================================================ */
router.get("/users", async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select(
      "studentCode fullName email course password"
    );

    if (!students || students.length === 0) {
      return res.status(404).json({ message: "Không có sinh viên nào!" });
    }

    res.json(students);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách sinh viên:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách sinh viên" });
  }
});

export default router;
