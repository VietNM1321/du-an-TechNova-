import { useEffect, useState } from "react";
import axios from "axios";

const Users = () => {
  const [users, setUsers] = useState([]); // danh sách người dùng
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("")
  const adminToken = localStorage.getItem("adminToken");
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const data = Array.isArray(res.data) // Đảm bảo dữ liệu là mảng
        ? res.data
        : Array.isArray(res.data.users)
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
      await axios.put(
        `http://localhost:5000/api/users/${id}/toggle-active`,
        {},
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      fetchUsers();
    } catch (err) {
      console.error("Lỗi khi thay đổi trạng thái:", err);
      alert(
        err.response?.data?.message || "Không thể thay đổi trạng thái người dùng"
      );
    }
  };
  const clearForgotStatus = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/users/${id}/clear-forgot`,
        {},
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      fetchUsers();
    } catch (err) {
      console.error("Lỗi khi xóa trạng thái quên mật khẩu:", err);
      alert(err.response?.data?.message || "Không thể xóa trạng thái");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <p className="p-4">Đang tải dữ liệu...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3 text-green-700">
        Quản lý người dùng
      </h2>
      <table className="w-full border-collapse border border-gray-300 rounded-lg">
        <thead className="bg-green-100">
          <tr>
            <th className="border p-2">Mã SV</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Mật khẩu</th>
            <th className="border p-2">Trạng thái</th>
            <th className="border p-2">Quên mật khẩu</th>
            <th className="border p-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center p-4">
                Không có người dùng
              </td>
            </tr>
          ) : (
            users.map((u) => (
              <tr key={u._id} className="text-center hover:bg-gray-50">
                <td className="border p-2">{u.studentCode || "—"}</td>
                <td className="border p-2">{u.email}</td>
                <td className="border p-2">
                  {u.password ? (
                    <span className="text-green-600">Đã cấp</span>
                  ) : (
                    <span className="text-gray-500">Chưa cấp</span>
                  )}
                </td>
                <td className="border p-2">
                  {u.active ? (
                    <span className="text-green-600 font-medium">Hoạt động</span>
                  ) : (
                    <span className="text-red-600 font-medium">Bị khóa</span>
                  )}
                </td>

                {/* Trạng thái quên mật khẩu */}
                <td className="border p-2">
                  {u.forgotPassword ? (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-yellow-600 font-medium">
                        Đã yêu cầu
                      </span>
                      <button
                        onClick={() => clearForgotStatus(u._id)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Xóa trạng thái
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-500">Chưa yêu cầu</span>
                  )}
                </td>

                {/* Nút khóa / mở khóa */}
                <td className="border p-2">
                  <button
                    onClick={() => toggleActive(u._id)}
                    className={`px-3 py-1 rounded text-white ${
                      u.active
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
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
