import express from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import User from "../models/User.js";
import { verifyToken, requireRole } from "../middleware/auth.js";
import Course from "../models/Course.js";


dotenv.config();
const router = express.Router();
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
router.post("/register", async (req, res) => {
  try {
    const { studentCode, fullName, email, courseId } = req.body;

    if (!studentCode || !fullName || !email || !courseId) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
    }

    // ✅ Check email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được đăng ký!" });
    }

    // ✅ Lấy khóa học đã chọn
    const selectedCourse = await Course.findById(courseId);
    if (!selectedCourse) {
      return res.status(400).json({ message: "Khóa học không tồn tại!" });
    }

    // ✅ Validate studentCode phù hợp với min/max của khóa học
    const codeNum = parseInt(studentCode.slice(2)); // lấy số cuối sau 'PH'
    if (isNaN(codeNum)) {
      return res.status(400).json({ message: "Mã sinh viên không hợp lệ!" });
    }

    if (codeNum < selectedCourse.minStudentCode || codeNum > selectedCourse.maxStudentCode) {
      return res.status(400).json({
        message: `Mã sinh viên không phù hợp với khóa học ${selectedCourse.courseName}. ` +
                 `Phải từ PH${selectedCourse.minStudentCode
                   .toString()
                   .padStart(4, "0")} đến PH${selectedCourse.maxStudentCode
                   .toString()
                   .padStart(4, "0")}`
      });
    }

    // ✅ Tạo user
    const newUser = new User({
      studentCode,
      fullName,
      email,
      course: selectedCourse.courseName,
      role: "student",
      active: true,
      password: "", // chưa có mật khẩu
    });

    await newUser.save();

    // ✅ Thêm sinh viên vào khóa học
    selectedCourse.students.push({ studentCode, fullName });
    await selectedCourse.save();

    res.status(201).json({ message: "Đăng ký thành công!" });
  } catch (err) {
    console.error("❌ Lỗi đăng ký:", err);
    res.status(500).json({ message: "Lỗi server khi đăng ký!" });
  }
});

router.put("/setpassword/:id", verifyToken, requireRole("admin"), async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password) return res.status(400).json({ message: "Thiếu mật khẩu!" });

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng!" });

    if (!user.active) {
      return res.status(403).json({ message: "Sinh viên đã bị khóa, không thể cấp mật khẩu!" });
    }

    user.password = password;
    await user.save();
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
      subject: "Mật khẩu đăng nhập thư viện sách 📚",
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
router.get("/users", verifyToken, requireRole("admin"), async (req, res) => {
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
        _id: user._id,
        id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        studentCode: user.studentCode || "",
        studentId: user.studentCode || "",
      },
    });
  } catch (error) {
    console.error("❌ Lỗi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi server khi đăng nhập!" });
  }
});
router.put("/changepassword", verifyToken, async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "Vui lòng nhập đủ thông tin!" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản!" });
    }

    // Kiểm tra mật khẩu hiện tại
    if (user.password !== currentPassword) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng!" });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    res.json({ message: "✅ Đổi mật khẩu thành công!" });
  } catch (error) {
    console.error("❌ Lỗi đổi mật khẩu:", error);
    res.status(500).json({ message: "Lỗi server khi đổi mật khẩu!" });
  }
});

export default router;
