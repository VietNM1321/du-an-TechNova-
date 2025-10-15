import { useState, useEffect } from "react";
import axios from "axios";

const SetPassword = () => {
  const [users, setUsers] = useState([]);
  const [passwords, setPasswords] = useState({}); // mật khẩu đang nhập
  const [grantedPasswords, setGrantedPasswords] = useState({}); // mật khẩu đã cấp
  const [message, setMessage] = useState("");

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
      const res = await axios.get("http://localhost:5000/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách:", err);
      setMessage("❌ Không thể tải danh sách sinh viên (chưa đăng nhập admin?)");
    }
  };

  // 🧩 Cập nhật mật khẩu đang nhập
  const handlePasswordChange = (userId, value) => {
    setPasswords({ ...passwords, [userId]: value });
  };

  // 🧩 Validate độ dài mật khẩu
  const validatePassword = (password) => {
    if (password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự!";
    if (!/[A-Z]/.test(password)) return "Mật khẩu phải có ít nhất 1 chữ in hoa!";
    if (!/[0-9]/.test(password)) return "Mật khẩu phải chứa ít nhất 1 số!";
    return null;
  };

  // 🧩 Cấp hoặc đổi mật khẩu
  const handleSetPassword = async (userId) => {
    const password = passwords[userId];
    if (!password) {
      setMessage("⚠️ Vui lòng nhập mật khẩu!");
      return;
    }

    const validationError = validatePassword(password);
    if (validationError) {
      setMessage(`❌ ${validationError}`);
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/auth/setpassword/${userId}`,
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message || "✅ Cấp mật khẩu thành công!");
      setGrantedPasswords({
        ...grantedPasswords,
        [userId]: password,
      });
      setPasswords({ ...passwords, [userId]: "" });
    } catch (err) {
      console.error("Lỗi khi cấp mật khẩu:", err);
      setMessage("❌ Lỗi khi cấp mật khẩu!");
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-green-700 text-center">
        Cấp mật khẩu cho sinh viên
      </h2>

      {message && (
        <p className="mb-4 text-center text-sm text-gray-700">{message}</p>
      )}

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
              const granted = grantedPasswords[u._id];
              return (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{u.studentCode}</td>
                  <td className="px-4 py-2 border">{u.email}</td>
                  <td className="px-4 py-2 border">
                    {granted ? (
                      <span className="text-green-600 font-semibold">
                        {granted}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={passwords[u._id] || ""}
                        onChange={(e) =>
                          handlePasswordChange(u._id, e.target.value)
                        }
                        placeholder="Nhập mật khẩu..."
                        className="border rounded px-2 py-1 w-full"
                      />
                    )}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    <button
                      onClick={() => handleSetPassword(u._id)}
                      className={`${
                        granted
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-green-600 hover:bg-green-700"
                      } text-white px-3 py-1 rounded transition`}
                    >
                      {granted ? "Đổi mật khẩu" : "Cấp mật khẩu"}
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan="4"
                className="text-center py-4 text-gray-500 italic"
              >
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
