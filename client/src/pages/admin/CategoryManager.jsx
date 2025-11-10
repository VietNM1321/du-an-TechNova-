import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate()
  const fetchCategories = async (pageNum = 1) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/category?page=${pageNum}&limit=5`); // lấy dữ liệu khi load tang
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
  }, [page]);
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
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-lg mt-1">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-blue-700">📚 Quản lý danh mục sách</h2>
        <button
          onClick={() => navigate("/admin/category/add")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          ➕ Thêm danh mục
        </button>
      </div>

      <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-blue-100 text-blue-800">
          <tr>
            <th className="p-3 border text-left">Tên danh mục</th>
            <th className="p-3 border text-left">Mô tả</th>
            <th className="p-3 border text-center">Hành động</th>
          </tr>
        </thead>

        <tbody>
          {categories.map((cat) => (
            <tr key={cat._id} className="hover:bg-gray-50 h-20 align-middle">
              <td className="p-3 border align-middle">{cat.name}</td>
              <td className="p-3 border text-gray-600 italic align-middle">{cat.description}</td>
              <td className="p-3 border text-center align-middle">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => navigate(`/admin/category/edit/${cat._id}`)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded flex items-center gap-1"
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {categories.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center py-6 text-gray-500 italic">
                📭 Chưa có danh mục nào.
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

export default CategoryManager;
