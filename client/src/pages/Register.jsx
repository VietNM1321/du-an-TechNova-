import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [studentCode, setStudentCode] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validate mã sinh viên: PH + 4 chữ số
    if (!/^PH\d{4}$/.test(studentCode)) {
      setError("Mã sinh viên phải bắt đầu bằng 'PH' và theo sau là 4 chữ số!");
      return;
    }

    setError(""); // reset lỗi

    try {
      const res = await axios.post("http://localhost:5000/auth/register", {
        studentCode,
        email,
      });

      setMessage("✅ " + res.data.message);
      setStudentCode("");
      setEmail("");

      // Tự động chuyển về trang đăng nhập sau 1.5s
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Register error:", err.response || err.message);
      setMessage(err.response?.data?.message || "❌ Đăng ký thất bại!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
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
              onChange={(e) => setStudentCode(e.target.value.toUpperCase())} // tự chuyển chữ hoa
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
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
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            />
          </div>

          {/* Nút đăng ký */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Đăng ký
          </button>

          {/* Nút quay lại login */}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-50 transition"
          >
            Quay lại đăng nhập
          </button>
        </form>

        {/* Thông báo thành công hoặc lỗi */}
        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              message.includes("✅") ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          © 2025 <span className="font-semibold text-blue-600">BookZone</span>.
          All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Register;
