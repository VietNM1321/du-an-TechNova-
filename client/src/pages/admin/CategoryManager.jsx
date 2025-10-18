import React, { useEffect, useState } from "react";
import axios from "axios";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [id, setid] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await axios.put(`http://localhost:5000/api/category/${id}`, form);
        alert("✅ Cập nhật danh mục thành công!");
      } else {
        await axios.post("http://localhost:5000/api/category", form);
        alert("✅ Thêm danh mục thành công!");
      }
      setForm({ name: "", description: "" });
      setid(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert("❌ Thao tác thất bại!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa danh mục này?")) {
      try {
        await axios.delete(`http://localhost:5000/api/category/${id}`);
        alert("🗑️ Xóa thành công!");
        fetchCategories();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description });
    setid(cat._id);
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white shadow-lg rounded-xl p-8">
      <h2 className="text-3xl font-bold text-blue-700 mb-8 text-center">
        📚 Quản lý danh mục sách
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-50 p-6 rounded-lg shadow mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1 text-gray-700">
              Tên danh mục
            </label>
            <input
              type="text"
              placeholder="Nhập tên danh mục..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-gray-700">
              Mô tả
            </label>
            <input
              type="text"
              placeholder="Nhập mô tả..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
        <button
          type="submit"
          className={`mt-4 px-6 py-2 rounded-lg text-white font-semibold ${
            id ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {id ? "Cập nhật" : "Thêm mới"}
        </button>
      </form>

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
                      onClick={() => handleEdit(cat)}
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
