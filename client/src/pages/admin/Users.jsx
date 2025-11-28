import { useEffect, useState } from "react";
import axios from "axios";
import { Users as UsersIcon } from "lucide-react";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const adminToken = localStorage.getItem("adminToken");

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5001/api/users", {
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
      await axios.put(`http://localhost:5001/api/users/${id}/toggle-active`, {}, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, active: !u.active } : u));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Không thể thay đổi trạng thái");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 flex items-center justify-center text-slate-500">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-2xl text-blue-700 shadow-inner">
              <UsersIcon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Quản lý người dùng</h2>
              <p className="text-sm text-slate-500">Theo dõi tài khoản sinh viên và trạng thái hoạt động</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Tổng người dùng</p>
            <p className="text-2xl font-bold text-blue-600">{users.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 uppercase text-xs tracking-wide">
                <tr>
                  <th className="p-4 text-left">Mã SV</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400">Không có người dùng</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-blue-50 transition">
                      <td className="p-4 font-semibold text-slate-900">{u.studentCode || "—"}</td>
                      <td className="p-4">{u.email}</td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold ${
                            u.active ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          {u.active ? "Hoạt động" : "Bị khóa"}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleActive(u._id)}
                          className={`px-4 py-2 rounded-2xl text-xs font-semibold text-white ${
                            u.active ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-500 hover:bg-emerald-600"
                          } transition`}
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
        </div>
      </div>
    </div>
  );
};

export default Users;
