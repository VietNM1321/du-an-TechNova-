import { useEffect, useState } from "react";
import axios from "axios";

const Users = () => {
  const [users, setUsers] = useState([]); // danh sách người dùng
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("")
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [active, setActive] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [typingTimer, setTypingTimer] = useState(null);
  const adminToken = localStorage.getItem("adminToken");
  const fetchUsers = async (pageNum = 1, params = {}) => {
    try {
      setLoading(true);
      const q = params.q ?? query;
      const r = params.role ?? role;
      const a = params.active ?? active;
      const df = params.dateFrom ?? dateFrom;
      const dt = params.dateTo ?? dateTo;
      const s = params.sort ?? sort;
      const o = params.order ?? order;
      const l = params.limit ?? limit;

      const parts = [
        `page=${pageNum}`,
        `limit=${l}`,
        q ? `q=${encodeURIComponent(q)}` : "",
        r ? `role=${encodeURIComponent(r)}` : "",
        a !== "" ? `active=${encodeURIComponent(a)}` : "",
        df ? `dateFrom=${encodeURIComponent(df)}` : "",
        dt ? `dateTo=${encodeURIComponent(dt)}` : "",
        s ? `sort=${encodeURIComponent(s)}` : "",
        o ? `order=${encodeURIComponent(o)}` : "",
      ].filter(Boolean);

      const res = await axios.get(`http://localhost:5000/api/users?${parts.join("&")}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const payload = res.data || {};
      const list = Array.isArray(payload.users) ? payload.users : [];
      setUsers(list);
      setTotalPages(payload.totalPages || 1);
      setPage(payload.currentPage || pageNum);
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
    fetchUsers(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, role, active, dateFrom, dateTo, sort, order]);

  const onChangeQuery = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (typingTimer) clearTimeout(typingTimer);
    const timer = setTimeout(() => {
      setPage(1);
      fetchUsers(1, { q: value });
    }, 400);
    setTypingTimer(timer);
  };

  const onClearFilters = () => {
    setQuery("");
    setRole("");
    setActive("");
    setDateFrom("");
    setDateTo("");
    setSort("createdAt");
    setOrder("desc");
    setLimit(10);
    setPage(1);
    fetchUsers(1, { q: "" });
  };

  if (loading) return <p className="p-4">Đang tải dữ liệu...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3 text-green-700">
        Quản lý người dùng
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
          <input
            type="text"
            value={query}
            onChange={onChangeQuery}
            placeholder="Tên, email, MSSV, điện thoại..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Tất cả</option>
            <option value="admin">Admin</option>
            <option value="student">Sinh viên</option>
            <option value="client">Khách</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
          <select
            value={active}
            onChange={(e) => { setActive(e.target.value); setPage(1); }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Tất cả</option>
            <option value="true">Hoạt động</option>
            <option value="false">Bị khóa</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tạo từ</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tạo đến</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sắp xếp theo</label>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="createdAt">Ngày tạo</option>
            <option value="fullName">Tên</option>
            <option value="email">Email</option>
            <option value="role">Vai trò</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự</label>
          <select
            value={order}
            onChange={(e) => { setOrder(e.target.value); setPage(1); }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="desc">Giảm dần</option>
            <option value="asc">Tăng dần</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mỗi trang</label>
          <select
            value={limit}
            onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={onClearFilters}
            className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Đặt lại
          </button>
        </div>
      </div>
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
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 gap-3">
          <button
            onClick={() => page > 1 && setPage(page - 1)}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg ${
              page === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            ◀ Trước
          </button>
          <span className="text-gray-700 font-medium">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => page < totalPages && setPage(page + 1)}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-lg ${
              page === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            Sau ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default Users;
