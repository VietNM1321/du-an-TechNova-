import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Layers } from "lucide-react";
const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(5);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("asc");
  const [typingTimer, setTypingTimer] = useState(null);
  const navigate = useNavigate()
  const fetchCategories = async (pageNum = 1, params = {}) => {
    try {
      const q = params.q ?? query;
      const s = params.sort ?? sort;
      const o = params.order ?? order;
      const l = params.limit ?? limit;
      const res = await axios.get(
        `http://localhost:5000/api/category?page=${pageNum}&limit=${l}${q ? `&q=${encodeURIComponent(q)}` : ""}${s ? `&sort=${encodeURIComponent(s)}` : ""}${o ? `&order=${encodeURIComponent(o)}` : ""}`
      );
      setCategories(res.data.categories || []);
      setTotalPages(res.data.totalPages || 1);
      setPage(res.data.currentPage || 1);
    } catch (error) {
      console.error("Lỗi tải danh mục:", error);
      setCategories([]);
    }
  };
  useEffect(() => {
    fetchCategories(page);
  }, [page, limit, sort, order]);
  const onChangeQuery = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (typingTimer) clearTimeout(typingTimer);
    const timer = setTimeout(() => {
      setPage(1);
      fetchCategories(1, { q: value });
    }, 400);
    setTypingTimer(timer);
  };
  const onClearFilters = () => {
    setQuery("");
    setSort("createdAt");
    setOrder("asc");
    setLimit(5);
    setPage(1);
    fetchCategories(1, { q: "" });
  };
  useEffect(() => {
  const { updatedBook, updatedProducts } = location.state || {};
  if (updatedBook) {
    setBooks(prev =>
      prev.map(b =>
        b._id === updatedBook._id
          ? { ...b, bookCode: updatedBook.bookCode }
          : b
      )
    );
    if (updatedProducts && updatedProducts.length) {
      setProducts(prev =>
        prev.map(p => {
          const updated = updatedProducts.find(u => u._id === p._id);
          return updated ? { ...p, bookCode: updated.bookCode } : p;
        })
      );
    }
    window.history.replaceState({}, document.title);
  }
}, [location.state]);
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa danh mục này?")) {
      try {
        const res = await axios.delete(`http://localhost:5000/api/category/${id}`);
        alert(res.data.message || "✅ Xóa thành công!");
        fetchCategories(page);
      } catch (err) {
        alert(
          err.response?.data?.message ||
            "❌ Không thể xóa danh mục. Do danh mục đang có sách!"
        );
      }
    }
  };
  const handlePrev = () => { // phân trang
    if (page > 1) setPage(page - 1);
  }
  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-2xl text-blue-700 shadow-inner">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Quản lý danh mục sách</h2>
              <p className="text-sm text-slate-500">Tổ chức và phân loại các đầu sách trong thư viện</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/admin/category/add")}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 text-white px-4 py-2.5 text-sm font-semibold shadow hover:bg-blue-700 transition"
          >
            ➕ Thêm danh mục
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 grid grid-cols-1 lg:grid-cols-4 gap-5">
          <div className="lg:col-span-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tìm kiếm</label>
            <input
              type="text"
              value={query}
              onChange={onChangeQuery}
              placeholder="Nhập tên hoặc mô tả danh mục..."
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Sắp xếp theo</label>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="createdAt">Ngày tạo</option>
              <option value="name">Tên</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Thứ tự</label>
            <select
              value={order}
              onChange={(e) => { setOrder(e.target.value); setPage(1); }}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="asc">Tăng dần</option>
              <option value="desc">Giảm dần</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mỗi trang</label>
            <select
              value={limit}
              onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={onClearFilters}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Đặt lại
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 uppercase text-xs tracking-wide">
                <tr>
                  <th className="p-4 text-left">Tên danh mục</th>
                  <th className="p-4 text-left">Mô tả</th>
                  <th className="p-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-blue-50 transition">
                    <td className="p-4 font-semibold text-slate-900">{cat.name}</td>
                    <td className="p-4 text-slate-500 italic">{cat.description || "—"}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/category/edit/${cat._id}`)}
                          className="px-3 py-2 rounded-2xl text-xs font-semibold text-slate-700 bg-yellow-100 hover:bg-yellow-200 transition"
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id)}
                          className="px-3 py-2 rounded-2xl text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 shadow-sm transition"
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {categories.length === 0 && (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-slate-400 text-sm">
                      📭 Chưa có danh mục nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={handlePrev}
            disabled={page === 1}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold ${
              page === 1
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            } transition`}
          >
            ◀ Trước
          </button>
          <span className="text-sm font-semibold text-slate-600">
            Trang {page}/{totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold ${
              page === totalPages
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            } transition`}
          >
            Sau ▶
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
