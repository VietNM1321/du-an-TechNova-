import { useState, useEffect } from "react";
import axios from "axios";

const SetPassword = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // 🧩 Lấy token từ localStorage (admin login)
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      fetchUsers();
    } else {
      setMessage("⚠️ Vui lòng đăng nhập admin trước khi cấp mật khẩu!");
    }
  }, []);

  // 🧩 Lấy danh sách người dùng
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách:", err);
      setMessage("❌ Không thể tải danh sách sinh viên (chưa đăng nhập admin?)");
    }
  };

  // 🧩 Gửi mật khẩu mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser || !password) {
      setMessage("⚠️ Vui lòng chọn sinh viên và nhập mật khẩu!");
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/auth/setpassword/${selectedUser}`,
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message || "✅ Cấp mật khẩu thành công!");
      setPassword("");
    } catch (err) {
      console.error("Lỗi khi cấp mật khẩu:", err);
      setMessage("❌ Lỗi khi cấp mật khẩu!");
    }
  };

  return (
    
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-green-700">
        Cấp mật khẩu cho sinh viên
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Chọn sinh viên */}
        <div>
          <label className="block font-semibold mb-1">Chọn sinh viên:</label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="border rounded w-full px-3 py-2"
          >
            <option value="">-- Chọn sinh viên --</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.studentCode} - {u.email}
              </option>
            ))}
          </select>
        </div>

        {/* Nhập mật khẩu */}
        <div>
          <label className="block font-semibold mb-1">Mật khẩu mới:</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded w-full px-3 py-2"
            placeholder="Nhập mật khẩu"
          />
        </div>

        {/* Nút xác nhận */}
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Xác nhận cấp mật khẩu
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}
      </form>
    </div>
  );
};

export default SetPassword;