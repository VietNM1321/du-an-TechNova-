import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/category");
      setCategories(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh mục:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
  if (window.confirm("Bạn có chắc muốn xóa danh mục này?")) {
    try {
      const res = await axios.delete(`http://localhost:5000/api/category/${id}`);
      alert(res.data.message || "🗑️ Xóa thành công!");
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "❌ Danh mục đang có sách!");
    }
  }
};

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white shadow-lg rounded-xl p-8">
      <h2 className="text-3xl font-bold text-blue-700 mb-8 text-center">
        📚 Quản lý danh mục sách
      </h2>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate("/admin/category/add")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          ➕ Thêm danh mục
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Tên danh mục</th>
              <th className="py-3 px-4 text-left">Mô tả</th>
              <th className="py-3 px-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-6 text-gray-500">
                  Không có danh mục nào.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr
                  key={cat._id}
                  className="hover:bg-gray-50 transition duration-200"
                >
                  <td className="py-3 px-4">{cat.name}</td>
                  <td className="py-3 px-4">{cat.description}</td>
                  <td className="py-3 px-4 text-center space-x-3">
                    <button
                      onClick={() => navigate(`/admin/category/edit/${cat._id}`)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded-lg"
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-lg"
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryManager;
