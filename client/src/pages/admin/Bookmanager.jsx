import React, { useEffect, useState } from "react";
import axios from "axios";
import { BookOpen } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
const BookLManager = () => {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(5);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [availableMin, setAvailableMin] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [typingTimer, setTypingTimer] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const fetchBooks = async (pageNum = 1, params = {}) => {
    try {
      const q = params.q ?? query;
      const s = params.sort ?? sort;
      const o = params.order ?? order;
      const l = params.limit ?? limit;
      const c = params.category ?? categoryId;
      const a = params.author ?? authorId;
      const yf = params.yearFrom ?? yearFrom;
      const yt = params.yearTo ?? yearTo;
      const av = params.availableMin ?? availableMin;
      const parts = [`page=${pageNum}`,`limit=${l}`,
        q ? `q=${encodeURIComponent(q)}` : "",
        s ? `sort=${encodeURIComponent(s)}` : "",
        o ? `order=${encodeURIComponent(o)}` : "",
        c ? `category=${encodeURIComponent(c)}` : "",
        a ? `author=${encodeURIComponent(a)}` : "",
        yf ? `yearFrom=${encodeURIComponent(yf)}` : "",
        yt ? `yearTo=${encodeURIComponent(yt)}` : "",
        av !== "" ? `availableMin=${encodeURIComponent(av)}` : "",
      ].filter(Boolean);
      const res = await axios.get(`http://localhost:5001/api/books?${parts.join("&")}`);
      const data = res.data;
      if (Array.isArray(data)) {
        setBooks(data);
        setTotalPages(1);
        setPage(1);
      } else {
        setBooks(data.books || []);
        setTotalPages(data.totalPages || 1);
        setPage(data.currentPage || pageNum);
      }
    } catch (err) {
      console.error("❌ Lỗi lấy danh sách sách:", err);
      setBooks([]);
    }
  };
  useEffect(() => {
    if (location.state?.updatedBook) {
      const updated = location.state.updatedBook;
      setBooks((prev) =>
        prev.map((b) =>
          b._id === updated._id
            ? {
                ...b,
                code: updated.bookCode || updated.code,
                Pricebook: updated.Pricebook ?? b.Pricebook,
              }
            : b
        )
      );
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  useEffect(() => {
    const init = async () => {
      try {
        const [catRes, authorRes] = await Promise.all([
          axios.get("http://localhost:5001/api/category?limit=1000"),
          axios.get("http://localhost:5001/api/authors?limit=1000"),
        ]);
        setCategories(catRes.data.categories || catRes.data || []);
        setAuthors(authorRes.data.authors || authorRes.data || []);
      } catch (e) {
      }
      fetchBooks(page);
    };
    init();
  }, [page, limit, sort, order, categoryId, authorId, yearFrom, yearTo, availableMin]);

  const onChangeQuery = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (typingTimer) clearTimeout(typingTimer);
    const timer = setTimeout(() => {
      setPage(1);
      fetchBooks(1, { q: value });
    }, 400);
    setTypingTimer(timer);
  };
  const onClearFilters = () => {
    setQuery("");
    setCategoryId("");
    setAuthorId("");
    setYearFrom("");
    setYearTo("");
    setAvailableMin("");
    setSort("createdAt");
    setOrder("desc");
    setLimit(5);
    setPage(1);
    fetchBooks(1, { q: "" });
  };
  const handleDelete = async (id) => {
    if (window.confirm("❗ Bạn có chắc muốn xóa sách không?")) {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          alert("⚠️ Vui lòng đăng nhập lại với quyền admin để xóa sách.");
          navigate("/admin/login");
          return;
        }
        await axios.delete(`http://localhost:5001/api/books/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchBooks(page);
      } catch (err) {
        console.error("❌ Xóa thất bại:", err);
        alert("❌ Xóa thất bại!");
      }
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-2xl text-blue-700 shadow-inner">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Quản lý Sách</h2>
              <p className="text-sm text-slate-500">
                Quản lý, lọc và theo dõi danh sách sách trong thư viện
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/admin/bookadd")}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 text-white px-4 py-2.5 text-sm font-semibold shadow hover:bg-blue-700 transition"
            >
              ➕ Thêm sách mới
            </button>
            <button
              onClick={() => navigate("/admin/return-books")}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 text-white px-4 py-2.5 text-sm font-semibold shadow hover:bg-emerald-600 transition"
            >
              🔁 Trả sách
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 grid grid-cols-1 lg:grid-cols-4 gap-5">
          <div className="lg:col-span-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tìm kiếm</label>
            <input
              type="text"
              value={query}
              onChange={onChangeQuery}
              placeholder="Tên, mô tả hoặc mã sách..."
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Thể loại</label>
            <select
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Tất cả</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tác giả</label>
            <select
              value={authorId}
              onChange={(e) => { setAuthorId(e.target.value); setPage(1); }}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Tất cả</option>
              {authors.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Năm từ</label>
            <input
              type="number"
              value={yearFrom}
              onChange={(e) => { setYearFrom(e.target.value); setPage(1); }}
              placeholder="VD: 2010"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Năm đến</label>
            <input
              type="number"
              value={yearTo}
              onChange={(e) => { setYearTo(e.target.value); setPage(1); }}
              placeholder="VD: 2024"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Sẵn có tối thiểu</label>
            <input
              type="number"
              min="0"
              value={availableMin}
              onChange={(e) => { setAvailableMin(e.target.value); setPage(1); }}
              placeholder="0"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
              <option value="title">Tên sách</option>
              <option value="publishedYear">Năm</option>
              <option value="available">Sẵn có</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Thứ tự</label>
            <select
              value={order}
              onChange={(e) => { setOrder(e.target.value); setPage(1); }}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="desc">Giảm dần</option>
              <option value="asc">Tăng dần</option>
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
                  <th className="p-4 text-left">Ảnh</th>
                  <th className="p-4 text-left">Mã sách</th>
                  <th className="p-4 text-left">Tên sách</th>
                  <th className="p-4 text-left">Thể loại</th>
                  <th className="p-4 text-left">Tác giả</th>
                  <th className="p-4 text-center">Năm</th>
                  <th className="p-4 text-center">SL</th>
                  <th className="p-4 text-center">Còn</th>
                  <th className="p-4 text-center">Giá đền bù</th>
                  <th className="p-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {books.length > 0 ? (
                  books.map((b, i) => (
                    <tr
                      key={b._id}
                      className={`${i % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-blue-50 transition`}
                    >
                      <td className="p-4">
                        <div className="flex items-center justify-center">
                          {b.images?.[0] ? (
                            <img
                              src={b.images[0]}
                              alt={b.title}
                              className="w-14 h-16 object-cover rounded-xl ring-1 ring-slate-100 shadow-sm"
                            />
                          ) : (
                            <span className="text-xs text-slate-400">Không ảnh</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-sm text-slate-600">{b.code || "—"}</td>
                      <td className="p-4 font-semibold text-slate-900">{b.title}</td>
                      <td className="p-4">{b.category?.name || "—"}</td>
                      <td className="p-4">{b.author?.name || "—"}</td>
                      <td className="p-4 text-center">{b.publishedYear || "—"}</td>
                      <td className="p-4 text-center font-semibold text-slate-900">{b.quantity || 0}</td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${
                            (b.available ?? 0) > 0
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          {b.available || 0}
                        </span>
                      </td>
                      <td className="p-4 text-center text-rose-600 font-semibold">
                        {(b.Pricebook ?? 0).toLocaleString("vi-VN")} đ
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/book/edit/${b._id}`)}
                            className="px-3 py-2 rounded-2xl text-xs font-semibold text-slate-700 bg-yellow-100 hover:bg-yellow-200 transition"
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(b._id)}
                            className="px-3 py-2 rounded-2xl text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 shadow-sm transition"
                          >
                            🗑️ Xóa
                          </button>
                          <button
                            onClick={() => navigate(`/admin/book/detail/${b._id}`)}
                            className="px-3 py-2 rounded-2xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition"
                          >
                            📘 Chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="py-8 text-center text-slate-400 text-sm">
                      📭 Chưa có sách nào trong danh sách.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => page > 1 && setPage(page - 1)}
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
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => page < totalPages && setPage(page + 1)}
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
        )}
      </div>
    </div>
  );
};

export default BookLManager;
