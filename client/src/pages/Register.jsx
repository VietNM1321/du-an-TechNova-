import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [studentCode, setStudentCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [courseId, setCourseId] = useState(""); // dùng _id của course
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Lấy danh sách khóa học
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/courses");
        if (Array.isArray(res.data)) setCourses(res.data);
      } catch (err) {
        console.error("❌ Lỗi khi tải khóa học:", err);
      }
    };
    fetchCourses();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validate format studentCode
    if (!/^PH\d{4,}$/.test(studentCode)) {
      setError("⚠️ Mã sinh viên phải bắt đầu bằng 'PH' và theo sau là số!");
      return;
    }
    if (!fullName.trim()) {
      setError("⚠️ Vui lòng nhập họ và tên sinh viên!");
      return;
    }
    if (!email.trim()) {
      setError("⚠️ Vui lòng nhập email!");
      return;
    }
    if (!courseId) {
      setError("⚠️ Vui lòng chọn khóa học!");
      return;
    }

    // Validate studentCode nằm trong range khóa học
    const selectedCourse = courses.find((c) => c._id === courseId);
    if (!selectedCourse) {
      setError("⚠️ Khóa học không tồn tại!");
      return;
    }
    const codeNum = parseInt(studentCode.slice(2), 10);
    if (isNaN(codeNum)) {
      setError("⚠️ Mã sinh viên không hợp lệ!");
      return;
    }
    if (codeNum < selectedCourse.minStudentCode || codeNum > selectedCourse.maxStudentCode) {
      setError(
        `⚠️ Mã sinh viên không phù hợp với khóa học ${selectedCourse.courseName}. ` +
        `Phải từ PH${selectedCourse.minStudentCode.toString().padStart(4, "0")} đến PH${selectedCourse.maxStudentCode.toString().padStart(4, "0")}`
      );
      return;
    }

    setError("");
    setMessage("Đang xử lý...");

    try {
      const payload = {
        studentCode: studentCode.trim().toUpperCase(),
        fullName: fullName.trim(),
        email: email.trim(),
        courseId, // đúng với backend
      };
      console.log("Register payload:", payload);

      const res = await axios.post("http://localhost:5000/api/auth/register", payload);

      setMessage("✅ " + (res.data.message || "Đăng ký thành công!"));
      setStudentCode("");
      setFullName("");
      setEmail("");
      setCourseId("");

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Register error:", err);
      setMessage(
        err.response?.data?.message || "❌ Đăng ký thất bại. Vui lòng thử lại sau."
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-blue-100">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
          Đăng ký tài khoản sinh viên
        </h2>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          {/* Mã sinh viên */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Mã sinh viên
            </label>
            <input
              type="text"
              placeholder="VD: PH0001"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            />
          </div>

          {/* Họ và tên */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              placeholder="Nhập họ và tên sinh viên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Nhập email sinh viên"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            />
          </div>

          {/* Khóa học */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Chọn khóa học
            </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            >
              <option value="">-- Chọn khóa học --</option>
              {courses.length > 0 ? (
                courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.courseName} ({course.minStudentCode} - {course.maxStudentCode})
                  </option>
                ))
              ) : (
                <option disabled>Không có khóa học khả dụng</option>
              )}
            </select>
          </div>

          {/* Nút hành động */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all"
          >
            Đăng ký
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-50 transition-all"
          >
            Quay lại đăng nhập
          </button>
        </form>

        {(error || message) && (
          <p
            className={`mt-4 text-center text-sm ${
              error ? "text-red-600" : message.includes("✅") ? "text-green-600" : "text-blue-600"
            }`}
          >
            {error || message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;
