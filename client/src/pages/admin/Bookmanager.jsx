import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, Trash2, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BookLManager = () => {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();

  const fetchBooks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/books");
      setBooks(res.data.books || res.data);
    } catch (err) {
      console.error("Lỗi lấy sách:", err);
      setBooks([]);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa sách này không?")) {
      try {
        await axios.delete(`http://localhost:5000/api/books/${id}`);
        fetchBooks();
      } catch {
        alert("❌ Xóa thất bại!");
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-gradient-to-b from-gray-50 to-white p-8 rounded-2xl shadow-lg mt-12 border border-gray-200">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-semibold text-gray-800 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-700" />
          Quản lý Sách
        </h2>
        <button
          onClick={() => navigate("/admin/bookadd")}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
        >
          Thêm sách mới
        </button>
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
            {books.map((b, i) => (
              <tr
                key={b._id}
                className={`border-t border-gray-100 ${
                  i % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-blue-50 transition`}
              >
                <td className="p-3 text-center">
                  <img
                    src={b.images?.[0]}
                    alt={b.title}
                    className="w-14 h-14 object-cover rounded-lg shadow-sm mx-auto"
                  />
                </td>
                <td className="p-3 font-mono">{b.bookCode?.prefix || "—"}</td>
                <td className="p-3">{b.title}</td>
                <td className="p-3">{b.category?.name || "—"}</td>
                <td className="p-3">{b.author?.name || "—"}</td>
                <td className="p-3 text-center">{b.publishedYear || "—"}</td>
                <td className="p-3 text-center">{b.quantity || 0}</td>
                <td className="p-3 text-center">{b.available || 0}</td>
                <td className="p-3 text-center flex justify-center gap-2">
                  <button
                    onClick={() => navigate(`/admin/book/edit/${b._id}`)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(b._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                  >
                    🗑️ Xóa
                  </button>
                </td>
              </tr>
            ))}
            {books.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500 italic">
                  📭 Chưa có sách nào trong danh sách.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookLManager;