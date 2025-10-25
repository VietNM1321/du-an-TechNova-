import express from "express";
import Course from "../models/Course.js";

const router = express.Router();

/* ============================================================
   1️⃣  Thêm khóa học mới (Admin)
   ============================================================ */
router.post("/", async (req, res) => {
  try {
    const { courseName, courseCode, minStudentCode, maxStudentCode } = req.body;

    if (!courseName || !courseCode || !minStudentCode || !maxStudentCode)
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin khóa học!" });

    if (minStudentCode >= maxStudentCode)
      return res
        .status(400)
        .json({ message: "Khoảng mã sinh viên không hợp lệ!" });

    // Kiểm tra trùng tên hoặc mã khóa học
    const exist = await Course.findOne({
      $or: [{ courseName }, { courseCode }],
    });
    if (exist)
      return res.status(400).json({ message: "Khóa học đã tồn tại!" });

    // 🧩 Tự động sinh danh sách sinh viên trong khoảng mã
    const students = [];
    for (let i = minStudentCode; i <= maxStudentCode; i++) {
      const studentCode = "PH" + i.toString().padStart(4, "0"); // VD: PH0001
      students.push({ studentCode, fullName: "" }); // fullName để trống
    }

    const newCourse = await Course.create({
      courseName,
      courseCode,
      minStudentCode,
      maxStudentCode,
      students,
    });

    res.status(201).json({
      message: "✅ Tạo khóa học thành công!",
      course: newCourse,
    });
  } catch (err) {
    console.error("❌ Lỗi tạo khóa học:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   2️⃣  Lấy danh sách khóa học
   ============================================================ */
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách khóa học:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   3️⃣  Lấy chi tiết khóa học theo ID
   ============================================================ */
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course)
      return res.status(404).json({ message: "Không tìm thấy khóa học!" });

    res.json(course);
  } catch (err) {
    console.error("❌ Lỗi lấy chi tiết khóa học:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   4️⃣  Cập nhật thông tin khóa học (Admin)
   ============================================================ */
router.put("/:id", async (req, res) => {
  try {
    const { courseName, courseCode, minStudentCode, maxStudentCode } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course)
      return res.status(404).json({ message: "Không tìm thấy khóa học!" });

    if (minStudentCode && maxStudentCode && minStudentCode >= maxStudentCode)
      return res
        .status(400)
        .json({ message: "Khoảng mã sinh viên không hợp lệ!" });

    // Cập nhật thông tin cơ bản
    if (courseName) course.courseName = courseName;
    if (courseCode) course.courseCode = courseCode;

    // Nếu thay đổi min/max thì cập nhật lại danh sách sinh viên
    if (minStudentCode && maxStudentCode) {
      course.minStudentCode = minStudentCode;
      course.maxStudentCode = maxStudentCode;

      const students = [];
      for (let i = minStudentCode; i <= maxStudentCode; i++) {
        const studentCode = "PH" + i.toString().padStart(4, "0");
        students.push({ studentCode, fullName: "" });
      }
      course.students = students;
    }

    await course.save();

    res.json({
      message: "✅ Cập nhật khóa học thành công!",
      course,
    });
  } catch (err) {
    console.error("❌ Lỗi cập nhật khóa học:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   5️⃣  Xóa khóa học (Admin)
   ============================================================ */
router.delete("/:id", async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course)
      return res.status(404).json({ message: "Không tìm thấy khóa học!" });

    res.json({ message: "🗑️ Xóa khóa học thành công!" });
  } catch (err) {
    console.error("❌ Lỗi xóa khóa học:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
