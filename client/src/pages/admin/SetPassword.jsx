import { useEffect, useState } from "react";
import axios from "axios";

const SetPassword = () => {
  const [users, setUsers] = useState([]);
  const [passwords, setPasswords] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingIds, setLoadingIds] = useState([]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("UNAUTHENTICATED");
      const res = await axios.get("http://localhost:5000/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách:", err);
      if (err.response?.status === 401 || err.message === "UNAUTHENTICATED") {
        alert("Bạn cần đăng nhập với quyền Admin để truy cập.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Cập nhật mật khẩu local state khi nhập
  const handlePasswordChange = (id, value) => {
    setPasswords((prev) => ({ ...prev, [id]: value }));
  };

  // Cấp hoặc đổi mật khẩu
  const handleSetPassword = async (id) => {
    const password = passwords[id];
    if (!password) return alert("Vui lòng nhập mật khẩu!");

    setLoadingIds((prev) => [...prev, id]);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("UNAUTHENTICATED");
      const res = await axios.put(
        `http://localhost:5000/api/auth/setpassword/${id}`,
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message || "✅ Mật khẩu đã được cấp và gửi tới email sinh viên!");

      // Cập nhật trực tiếp state user
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u._id === id ? { ...u, password: true } : u
        )
      );

      // Reset input mật khẩu
      setPasswords((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data?.message) {
        alert(`❌ ${err.response.data.message}`);
      } else {
        const msg =
          err.response?.status === 401 || err.message === "UNAUTHENTICATED"
            ? "Bạn cần đăng nhập với quyền Admin để cấp mật khẩu."
            : "❌ Lỗi khi cấp mật khẩu!";
        alert(msg);
      }
    } finally {
      setLoadingIds((prev) => prev.filter((uid) => uid !== id));
    }
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-green-600">
        Cấp mật khẩu cho sinh viên
      </h2>
      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-green-100 text-left">
            <th className="px-4 py-2 border">Mã sinh viên</th>
            <th className="px-4 py-2 border">Họ tên</th>
            <th className="px-4 py-2 border">Email</th>
            <th className="px-4 py-2 border">Khóa học</th>
            <th className="px-4 py-2 border">Mật khẩu</th>
            <th className="px-4 py-2 border text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{u.studentCode}</td>
              <td className="border px-4 py-2">{u.fullName}</td>
              <td className="border px-4 py-2">{u.email}</td>
              <td className="border px-4 py-2">{u.course}</td>
              <td className="border px-4 py-2 text-center">
                {!u.active ? (
                  <span className="text-red-600 font-medium">Đã khóa</span>
                ) : u.password ? (
                  <span className="text-green-600 font-medium">Đã cấp</span>
                ) : (
                  <input
                    type="password"
                    value={passwords[u._id] || ""}
                    onChange={(e) =>
                      handlePasswordChange(u._id, e.target.value)
                    }
                    placeholder="Nhập mật khẩu..."
                    className="border rounded px-2 py-1 w-full"
                  />
                )}
              </td>
              <td className="border px-4 py-2 text-center">
                <button
                  onClick={() => handleSetPassword(u._id)}
                  disabled={loadingIds.includes(u._id) || !u.active}
                  className={`${
                    u.password
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-green-500 hover:bg-green-600"
                  } text-white px-3 py-1 rounded`}
                >
                  {loadingIds.includes(u._id)
                    ? "Đang xử lý..."
                    : !u.active
                    ? "Không thể cấp"
                    : u.password
                    ? "Đổi mật khẩu"
                    : "Cấp mật khẩu"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SetPassword;
