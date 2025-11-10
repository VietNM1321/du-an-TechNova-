import React, { useEffect, useState } from "react";
import axios from "axios";
import { BookOpen } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const BookLManager = () => {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();
  const fetchBooks = async (pageNum = 1) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/books?page=${pageNum}&limit=5`);
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
  // Cập nhật dữ liệu khi có sách mới được edit
  useEffect(() => {
    if (location.state?.updatedBook) {
      const updated = location.state.updatedBook;
      setBooks((prev) =>
        prev.map((b) =>
          b._id === updated._id
            ? { ...b, code: updated.bookCode || updated.code }
            : b
        )
      );
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  useEffect(() => {
    fetchBooks(page);
  }, [page]);
  const handleDelete = async (id) => {
    if (window.confirm("🗑️ Bạn có chắc muốn xóa sách này không?")) {
      try {
        await axios.delete(`http://localhost:5000/api/books/${id}`);
        fetchBooks(page);
      } catch (err) {
        console.error("❌ Xóa thất bại:", err);
        alert("❌ Xóa thất bại!");
      }
    }
  };
  return (
    <div className="max-w-6xl mx-auto bg-gradient-to-b from-gray-50 to-white p-8 rounded-2xl shadow-lg mt-4 border border-gray-200">
      <div className="flex items-center justify-between mb-8">
        <h2 className="flex items-center gap-2 text-[28px] font-bold text-[#0057FF] leading-none mt-1 mb-5">
          <BookOpen className="w-8 h-8 text-[#0057FF]" />
          <span>Quản lý Sách</span>
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/admin/bookadd")}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
          >
            ➕ Thêm sách mới
          </button>
          <button
            onClick={() => navigate("/admin/return-books")}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
          >
            🔁 Trả sách
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
        <table className="min-w-full">
          <thead className="bg-blue-50 text-blue-800">
            <tr>
              <th className="p-3 text-left">Ảnh</th>
              <th className="p-3 text-left">Mã sách</th>
              <th className="p-3 text-left">Tên sách</th>
              <th className="p-3 text-left">Thể loại</th>
              <th className="p-3 text-left">Tác giả</th>
              <th className="p-3 text-center">Năm</th>
              <th className="p-3 text-center">SL</th>
              <th className="p-3 text-center">Còn</th>
              <th className="p-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {books.length > 0 ? (
              books.map((b, i) => (
                <tr
                  key={b._id}
                  className={`border-t border-gray-100 ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50 transition`}
                >
                  <td className="p-3 text-center">
                    {b.images?.[0] ? (
                      <img
                        src={b.images[0]}
                        alt={b.title}
                        className="w-14 h-14 object-cover rounded-lg shadow-sm mx-auto"
                      />
                    ) : (
                      "❌"
                    )}
                  </td>
                  <td className="p-3 font-mono">{b.code || "—"}</td>
                  <td className="p-3">{b.title}</td>
                  <td className="p-3">{b.category?.name || "—"}</td>
                  <td className="p-3">{b.author?.name || "—"}</td>
                  <td className="p-3 text-center">{b.publishedYear || "—"}</td>
                  <td className="p-3 text-center">{b.quantity || 0}</td>
                  <td className="p-3 text-center">{b.available || 0}</td>
                  <td className="p-3 text-center flex justify-center gap-2">
                    <button
                      onClick={() => navigate(`/admin/book/edit/${b._id}`)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg"
                    >
                      ✏️ Sửa
                    </button>

                    <button
                      onClick={() => handleDelete(b._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                    >
                      🗑️ Xóa
                    </button>

                    <button
                      onClick={() => navigate(`/admin/book/detail/${b._id}`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      📘 Chi tiết
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="9"
                  className="text-center py-6 text-gray-500 italic"
                >
                  📭 Chưa có sách nào trong danh sách.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-3">
          <button
            onClick={() => page > 1 && setPage(page - 1)}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg ${
              page === 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
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
              page === totalPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            Sau ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default BookLManager;
