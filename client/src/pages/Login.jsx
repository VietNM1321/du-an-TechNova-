import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      if (user.role === "admin") {
        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminUser", JSON.stringify(user));
        localStorage.setItem("clientToken", token);
        localStorage.setItem("clientUser", JSON.stringify(user));
      } else {
        localStorage.setItem("clientToken", token);
        localStorage.setItem("clientUser", JSON.stringify(user));
      }

      window.dispatchEvent(new Event("authChange"));
      setMessage("✅ Đăng nhập thành công!");
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Đăng nhập thất bại!");
    }
  };

  const handleRegisterRedirect = () => navigate("/register");
  const handleForgotPasswordRedirect = () => navigate("/setpassword");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
          Đăng nhập
        </h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Đăng nhập
          </button>

          <button
            type="button"
            onClick={handleRegisterRedirect}
            className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-50 transition"
          >
            Đăng ký tài khoản mới
          </button>

         
          <p className="mt-2 text-center text-green-600 text-sm">
            <span
              onClick={handleForgotPasswordRedirect}
              className="cursor-pointer hover:underline"
            >
              Quên mật khẩu?
            </span>
          </p>
        </form>

        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              message.includes("thành công")
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          © 2025 <span className="font-semibold text-blue-600">TechNova</span>.
          All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
