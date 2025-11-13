import { useEffect, useState } from "react";
import axios from "axios";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const adminToken = localStorage.getItem("adminToken");

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Toggle active
  const toggleActive = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${id}/toggle-active`, {}, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, active: !u.active } : u));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Không thể thay đổi trạng thái");
    }
  };

  if (loading) return <p className="p-4">Đang tải dữ liệu...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3 text-green-700">Quản lý người dùng</h2>
      <table className="w-full border-collapse border border-gray-300 rounded-lg">
        <thead className="bg-green-100">
          <tr>
            <th className="border p-2">Mã SV</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Trạng thái</th>
            <th className="border p-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr><td colSpan="4" className="text-center p-4">Không có người dùng</td></tr>
          ) : users.map(u => (
            <tr key={u._id} className="text-center hover:bg-gray-50">
              <td className="border p-2">{u.studentCode}</td>
              <td className="border p-2">{u.email}</td>
              <td className="border p-2">{u.active ? "Hoạt động" : "Bị khóa"}</td>
              <td className="border p-2">
                <button
                  onClick={() => toggleActive(u._id)}
                  className={`px-3 py-1 rounded text-white ${u.active ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}
                >
                  {u.active ? "Khóa" : "Mở khóa"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
