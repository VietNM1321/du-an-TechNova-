import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import { verifyToken, requireRole } from "../middleware/auth.js";
import Course from "../models/Course.js";

dotenv.config();
const router = express.Router();

// Hàm tạo admin mặc định
export const createDefaultAdmin = async () => {
  try {
    const email = "admin@gmail.com";
    const existingAdmin = await User.findOne({ email });
    if (!existingAdmin) {
      const admin = new User({
        studentCode: "ADMIN001",
        email,
        fullName: "Admin",
        course: "Admin",
        role: "admin",
        active: true,
        password: "123456789", // mật khẩu plain
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

// ====================== Đăng ký sinh viên ======================
router.post("/register", async (req, res) => {
  try {
    const { studentCode, fullName, email, courseId } = req.body;

    if (!studentCode || !fullName || !email || !courseId)
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email đã được đăng ký!" });

    const selectedCourse = await Course.findById(courseId);
    if (!selectedCourse) return res.status(400).json({ message: "Khóa học không tồn tại!" });

    const codeNum = parseInt(studentCode.slice(2));
    if (isNaN(codeNum) || codeNum < selectedCourse.minStudentCode || codeNum > selectedCourse.maxStudentCode) {
      return res.status(400).json({
        message: `Mã sinh viên không phù hợp với khóa học ${selectedCourse.courseName}. ` +
                 `Phải từ PH${selectedCourse.minStudentCode.toString().padStart(4,"0")} ` +
                 `đến PH${selectedCourse.maxStudentCode.toString().padStart(4,"0")}`
      });
    }

    // Sinh mật khẩu 6 số ngẫu nhiên
    const passwordPlain = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
      studentCode,
      fullName,
      email,
      course: selectedCourse.courseName,
      role: "student",
      active: true,
      password: passwordPlain,
    });
    await newUser.save();

    selectedCourse.students.push({ studentCode, fullName });
    await selectedCourse.save();

    console.log(`Mật khẩu sinh viên: ${passwordPlain}`);

    res.status(201).json({
      message: "Đăng ký thành công! Mật khẩu sinh viên đã được sinh tự động.",
      password: passwordPlain
    });
  } catch (err) {
    console.error("❌ Lỗi đăng ký:", err);
    res.status(500).json({ message: "Lỗi server khi đăng ký!" });
  }
});

// ====================== Set mật khẩu cho sinh viên (admin) ======================
router.put("/setpassword/:id", verifyToken, requireRole("admin"), async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng!" });
    if (!user.active) return res.status(403).json({ message: "Sinh viên đã bị khóa!" });

    const newPassword = Math.floor(100000 + Math.random() * 900000).toString();
    user.password = newPassword;
    await user.save();

    res.json({ message: "Cấp mật khẩu thành công!", password: newPassword });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server!" });
  }
});

// ====================== Reset mật khẩu sinh viên (admin) ======================
router.put("/resetpassword/:id", verifyToken, requireRole("admin"), async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng!" });
    if (!user.active) return res.status(403).json({ message: "Sinh viên đã bị khóa, không thể reset mật khẩu!" });

    const newPassword = Math.floor(100000 + Math.random() * 900000).toString();
    user.password = newPassword;
    await user.save();

    res.json({ message: "✅ Mật khẩu đã được reset thành công!", password: newPassword });
  } catch (err) {
    console.error("❌ Lỗi khi reset mật khẩu:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
});

// ====================== Lấy danh sách sinh viên (admin) ======================
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

// ====================== Toggle active (admin) ======================
router.put("/users/:id/toggle-active", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng!" });

    user.active = !user.active;
    await user.save();

    res.json({
      message: `Người dùng ${user.active ? "đã được mở khóa" : "đã bị khóa"} thành công!`,
      user,
    });
  } catch (err) {
    console.error("❌ Lỗi khi toggle active:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
});

// ====================== Login ======================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Vui lòng nhập đủ email và mật khẩu!" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng!" });

    if (!user.active) return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa, không thể đăng nhập!" });

    if (user.password !== password)
      return res.status(400).json({ message: "Sai mật khẩu!" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

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

// ====================== Change password ======================
router.put("/changepassword", verifyToken, async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    if (!email || !currentPassword || !newPassword)
      return res.status(400).json({ message: "Vui lòng nhập đủ thông tin!" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản!" });

    if (user.password !== currentPassword)
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng!" });

    user.password = newPassword;
    await user.save();

    res.json({ message: "✅ Đổi mật khẩu thành công!" });
  } catch (error) {
    console.error("❌ Lỗi đổi mật khẩu:", error);
    res.status(500).json({ message: "Lỗi server khi đổi mật khẩu!" });
  }
});

export default router;
