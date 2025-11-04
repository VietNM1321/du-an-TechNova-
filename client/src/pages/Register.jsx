import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [studentCode, setStudentCode] = useState("");
  const [fullName, setFullName] = useState(""); // ✅ Thêm tên sinh viên
  const [email, setEmail] = useState("");
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 🟢 Lấy danh sách khóa học từ backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/courses");
        if (Array.isArray(res.data)) {
          setCourses(res.data);
        } else {
          console.error("Dữ liệu trả về không hợp lệ:", res.data);
          setCourses([]);
        }
      } catch (err) {
        console.error("❌ Lỗi khi tải danh sách khóa học:", err);
        setCourses([]);
      }
    };
    fetchCourses();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    // ✅ Kiểm tra hợp lệ đầu vào
    if (!/^PH\d{4}$/.test(studentCode)) {
      setError("⚠️ Mã sinh viên phải bắt đầu bằng 'PH' và theo sau là 4 chữ số!");
      return;
    }
    if (!fullName.trim()) {
      setError("⚠️ Vui lòng nhập họ và tên sinh viên!");
      return;
    }
    if (!courseId) {
      setError("⚠️ Vui lòng chọn khóa học!");
      return;
    }

    setError("");
    setMessage("Đang xử lý...");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        studentCode,
        fullName, // ✅ Gửi tên sinh viên
        email,
        course: courseId,
      });

      setMessage("✅ " + (res.data.message || "Đăng ký thành công!"));
      setStudentCode("");
      setFullName("");
      setEmail("");
      setCourseId("");

      // ⏳ Chuyển hướng sau 1.5s
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Register error:", err);
      const errorMsg =
        err.response?.data?.message ||
        "❌ Đăng ký thất bại. Vui lòng thử lại sau.";
      setMessage(errorMsg);
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
              placeholder="VD: PH1234"
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
                    {course.courseName} ({course.minStudentCode} -{" "}
                    {course.maxStudentCode})
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

        {/* Hiển thị lỗi hoặc thông báo */}
        {(error || message) && (
          <p
            className={`mt-4 text-center text-sm ${
              error
                ? "text-red-600"
                : message.includes("✅")
                ? "text-green-600"
                : "text-blue-600"
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
