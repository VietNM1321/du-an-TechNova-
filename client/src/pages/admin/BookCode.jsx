import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BookCodeManager = () => {
  const [bookCodes, setBookCodes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const fetchBookCodes = async (pageNum = 1) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/bookcodes?page=${pageNum}&limit=5`);
      setBookCodes(res.data.bookcodes || []);
      setTotalPages(res.data.pages || 1);
      setPage(res.data.page || 1);
    } catch (err) {
      console.error("Lỗi tải danh sách BookCode:", err);
      setBookCodes([]);
    }
  };

  useEffect(() => {
    fetchBookCodes(page);
  }, [page]);
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa BookCode này?")) {
      try {
        const res = await axios.delete(`http://localhost:5000/api/bookcodes/${id}`);
        alert(res.data.message || "✅ Xóa thành công!");
        fetchBookCodes(page);
      } catch (err) {
        alert(
          err.response?.data?.message ||
            "❌ Không thể xóa BookCode. Do đang có sách sử dụng!"
        );
      }
    }
  };

  // Phân trang
  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-lg mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-blue-700">📚 Quản lý BookCode</h2>
        <button
          onClick={() => navigate("/admin/bookcode/add")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          ➕ Thêm BookCode
        </button>
      </div>

      <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-blue-100 text-blue-800">
          <tr>
            <th className="p-3 border text-left">Category</th>
            <th className="p-3 border text-left">Code</th>
            <th className="p-3 border text-left">Last Number</th>
            <th className="p-3 border text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {bookCodes.map((b) => (
            <tr key={b._id} className="hover:bg-gray-50 h-16 align-middle">
              <td className="p-3 border">{b.category?.name || "—"}</td>
              <td className="p-3 border font-mono">{b.prefix}</td>
              <td className="p-3 border">{b.lastNumber}</td>
              <td className="p-3 border text-center">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => navigate(`/admin/bookcode/edit/${b._id}`)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(b._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {bookCodes.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center py-6 text-gray-500 italic">
                📭 Chưa có BookCode nào.
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

export default BookCodeManager;
