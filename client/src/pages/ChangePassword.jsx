import React, { useState, useEffect } from "react";
import axios from "axios";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

const ChangePassword = () => {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    const clientUser = JSON.parse(localStorage.getItem("clientUser"));
    if (clientUser?.email) setEmail(clientUser.email);
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!currentPassword || !newPassword) {
      setMessage("❌ Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("clientToken");
      if (!token) throw new Error("UNAUTHENTICATED");

      const res = await axios.put(
        "http://localhost:5000/api/auth/changepassword",
        { 
          email, 
          currentPassword, 
          newPassword 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(`✅ ${res.data.message}`);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Lỗi khi đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-xl font-bold mb-4 text-blue-700">Đổi mật khẩu</h2>

      <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
        {/* Email hiển thị */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full border px-3 py-2 rounded bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Mật khẩu hiện tại */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-600 mb-1">Mật khẩu hiện tại</label>
          <input
            type={showCurrent ? "text" : "password"}
            placeholder="Nhập mật khẩu hiện tại"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
          />
          <span
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3 top-[38px] cursor-pointer text-gray-500"
          >
            {showCurrent ? <AiFillEyeInvisible /> : <AiFillEye />}
          </span>
        </div>

        {/* Mật khẩu mới */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-600 mb-1">Mật khẩu mới</label>
          <input
            type={showNew ? "text" : "password"}
            placeholder="Nhập mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
          />
          <span
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-[38px] cursor-pointer text-gray-500"
          >
            {showNew ? <AiFillEyeInvisible /> : <AiFillEye />}
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-3 text-center text-sm ${
            message.includes("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default ChangePassword;

