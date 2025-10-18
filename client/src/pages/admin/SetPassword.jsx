import { useState, useEffect } from "react";
import axios from "axios";

const SetPassword = () => {
  const [users, setUsers] = useState([]);
  const [passwords, setPasswords] = useState({});
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) fetchUsers();
    else setMessage("⚠️ Vui lòng đăng nhập admin trước khi cấp mật khẩu!");
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setMessage("❌ Không thể tải danh sách sinh viên");
    }
  };

  const handlePasswordChange = (userId, value) => {
    setPasswords({ ...passwords, [userId]: value });
  };

  const handleSetPassword = async (userId) => {
    const password = passwords[userId];
    if (!password) return setMessage("⚠️ Vui lòng nhập mật khẩu!");

    try {
      const res = await axios.put(
        `http://localhost:5000/api/auth/setpassword/${userId}`,
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message || "✅ Cấp mật khẩu thành công!");
      fetchUsers(); // reload danh sách để cập nhật trạng thái password
      setPasswords({ ...passwords, [userId]: "" });
    } catch (err) {
      console.error(err);
      const errMsg =
        err.response?.data?.message ||
        "❌ Lỗi khi cấp mật khẩu (có thể đã cấp trước đó)";
      setMessage(errMsg);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-green-700">
          Cấp mật khẩu cho sinh viên
        </h2>
      </div>

      {message && <p className="mb-4 text-center text-sm">{message}</p>}

      <table className="min-w-full border border-gray-300 rounded-lg">
        <thead>
          <tr className="bg-green-100 text-left">
            <th className="px-4 py-2 border">Mã sinh viên</th>
            <th className="px-4 py-2 border">Email</th>
            <th className="px-4 py-2 border">Mật khẩu</th>
            <th className="px-4 py-2 border text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((u) => {
              const hasPassword = !!u.password;
              const isLocked = u.active === false;

              return (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{u.studentCode}</td>
                  <td className="px-4 py-2 border">{u.email}</td>
                  <td className="px-4 py-2 border">
                    {hasPassword ? (
                      <span className="text-green-600 font-semibold">Đã cấp</span>
                    ) : isLocked ? (
                      <span className="text-red-600 italic">Bị khóa</span>
                    ) : (
                      <input
                        type="text"
                        value={passwords[u._id] || ""}
                        onChange={(e) => handlePasswordChange(u._id, e.target.value)}
                        placeholder="Nhập mật khẩu..."
                        className="border rounded px-2 py-1 w-full"
                      />
                    )}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {hasPassword ? (
                      <button
                        onClick={() => handleSetPassword(u._id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                      >
                        Đổi mật khẩu
                      </button>
                    ) : isLocked ? (
                      <button
                        disabled
                        className="bg-gray-400 text-white px-3 py-1 rounded cursor-not-allowed"
                      >
                        Khóa
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSetPassword(u._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                      >
                        Cấp mật khẩu
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-4 text-gray-500 italic">
                Không có sinh viên nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SetPassword;
