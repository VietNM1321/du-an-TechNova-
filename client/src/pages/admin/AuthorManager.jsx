import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthorManager = () => {
  const [authors, setAuthors] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const API = "http://localhost:5000/api/authors";

  // lấy danh sách tác giả theo mảng và phân trang đây
  const fetchAuthors = async (pageNum = 1) => {
  try {
    const res = await axios.get(`${API}?page=${pageNum}&limit=5`);
    setAuthors(res.data.authors || []);
    setTotalPages(res.data.totalPages || 1);
    setPage(res.data.currentPage || 1);
  } catch (error) {
    console.error("Lỗi tải danh sách tác giả:", error);
    setAuthors([]);
  }
};

  useEffect(() => {
    fetchAuthors(page);
  }, [page]);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa tác giả này?")) {
      try {
        const res = await axios.delete(`${API}/${id}`);
        alert(res.data.message || "✅ Xóa thành công!");
        fetchAuthors(page);
      } catch (err) {
        alert(
          err.response?.data?.message ||
            "❌ Không thể xóa tác giả. Do tác giả đang có sách!"
        );
      }
    }
  };
  // cấu trúc phân trang đây
  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-lg mt-3">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-blue-700">📚 Quản lý Tác giả</h2>
        <button
          onClick={() => navigate("/admin/author/add")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          ➕ Thêm tác giả
        </button>
      </div>

      <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-blue-100 text-blue-800">
          <tr>
            <th className="p-3 border text-center">Ảnh</th>
            <th className="p-3 border text-left">Tên</th>
            <th className="p-3 border text-center">Ngày sinh</th>
            <th className="p-3 border text-center">Ngày mất</th>
            <th className="p-3 border text-left">Tiểu sử</th>
            <th className="p-3 border text-center">Hành động</th>
          </tr>
        </thead>

        <tbody>
          {authors.map((a) => (
            <tr
              key={a._id}
              className="hover:bg-gray-50 h-20 align-middle"
            >
              <td className="p-3 border text-center align-middle">
                {a.image ? (
                  <img
                    src={`http://localhost:5000/${a.image}`}
                    alt={a.name}
                    className="w-14 h-14 object-cover rounded-full mx-auto"
                  />
                ) : (
                  "❌"
                )}
              </td>
              <td className="p-3 border align-middle">{a.name}</td>
              <td className="p-3 border text-center align-middle">
                {a.dateOfBirth
                  ? new Date(a.dateOfBirth).toLocaleDateString("vi-VN")
                  : "-"}
              </td>
              <td className="p-3 border text-center align-middle">
                {a.dateOfDeath
                  ? new Date(a.dateOfDeath).toLocaleDateString("vi-VN")
                  : "-"}
              </td>
              <td className="p-3 border text-gray-600 italic max-w-xs truncate align-middle">
                {a.bio}
              </td>
              <td className="p-3 border text-center align-middle">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => navigate(`/admin/authoredit/${a._id}`)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded flex items-center gap-1"
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(a._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {authors.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center py-6 text-gray-500 italic">
                📭 Chưa có tác giả nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex justify-center mt-6 space-x-4">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className={`px-4 py-2 rounded-lg border ${
            page === 1
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
              : "text-blue-600 border-blue-400 hover:bg-blue-100"
          }`}
        >
          ◀ Trước
        </button>

        <span className="px-4 py-2 text-gray-700 font-semibold">
          Trang {page}/{totalPages}
        </span>

        <button
          onClick={handleNext}
          disabled={page === totalPages}
          className={`px-4 py-2 rounded-lg border ${
            page === totalPages
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
              : "text-blue-600 border-blue-400 hover:bg-blue-100"
          }`}
        >
          Sau ▶
        </button>
      </div>
    </div>
  );
};

export default AuthorManager;
