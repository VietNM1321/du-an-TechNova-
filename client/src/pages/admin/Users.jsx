import { useEffect, useState } from "react";
import axios from "axios";

const Users = () => {
  const [users, setUsers] = useState([]); // khởi tạo state là array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/users");

      // Kiểm tra dữ liệu trả về có phải mảng không
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.users && Array.isArray(res.data.users)
        ? res.data.users
        : [];

      setUsers(data);
    } catch (err) {
      console.error("Lỗi khi fetch users:", err);
      setError("Không thể lấy danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${id}/toggle-active`);
      fetchUsers();
    } catch (err) {
      console.error("Lỗi khi thay đổi trạng thái:", err);
      alert("Không thể thay đổi trạng thái người dùng");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <p className="p-4">Đang tải dữ liệu...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Quản lý người dùng</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Mã SV</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Mật khẩu</th>
            <th className="border p-2">Trạng thái</th>
            <th className="border p-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center p-4">
                Không có người dùng
              </td>
            </tr>
          ) : (
            users.map((u) => (
              <tr key={u._id} className="text-center">
                <td className="border p-2">{u.studentCode || "—"}</td>
                <td className="border p-2">{u.email}</td>
                <td className="border p-2">{u.password ? "Đã cấp" : "Chưa cấp"}</td>
                <td className="border p-2">
                  {u.active ? (
                    <span className="text-green-600">Hoạt động</span>
                  ) : (
                    <span className="text-red-600">Bị khóa</span>
                  )}
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => toggleActive(u._id)}
                    className={`px-3 py-1 rounded text-white ${
                      u.active ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {u.active ? "Khóa" : "Mở khóa"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
