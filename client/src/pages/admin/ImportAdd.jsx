import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
const ImportAdd = () => {
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBook, setSelectedBook] = useState("");
  const [quantity, setQuantity] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/category?limit=1000");
        setCategories(res.data.categories || []);
      } catch (err) {
        toast.error("Lỗi khi tải danh mục");
      }
    };
    fetchCategories();
  }, []);
  const handleCategoryChange = async (e) => { // lấy dan mục và sách trongh đb
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    setBooks([]);
    setSelectedBook("");
    if (!categoryId) return
    try {
      const res = await axios.get(
        `http://localhost:5000/api/books?limit=1000&category=${categoryId}`
      );
      setBooks(res.data.books);
    } catch (err) {
      toast.error("Không tìm thấy sách trong danh mục này");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBook || !quantity || !selectedRole) {
      toast.warn("Vui lòng nhập đủ thông tin!");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/imports", {
        bookId: selectedBook,
        quantity: Number(quantity),
        userRole: selectedRole,
      });
      alert("✅ Nhập kho thành công!");
      navigate("/admin/importlist");
    } catch (err) {
      console.error("Lỗi khi nhập kho:", err);
      toast.error("Lỗi khi nhập kho!");
    }
  };
  return (
    <div className="max-w-xl mx-auto bg-white shadow-lg rounded-2xl p-8 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-700">📦 Nhập Sách Vào Kho</h2>
        <button
          onClick={() => navigate("/admin/importlist")}
          className="flex items-center gap-2 bg-gray-100 text-gray-700 font-medium px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-200 hover:shadow-sm transition-all duration-200"
        >
          ⬅️ <span>Quay lại</span>
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-semibold mb-1 text-gray-700">Danh mục</label>
          <select
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none transition"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1 text-gray-700">Chọn sách</label>
          <select
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none transition"
            value={selectedBook}
            onChange={(e) => setSelectedBook(e.target.value)}
            disabled={!selectedCategory}
          >
            <option value="">-- Chọn sách --</option>
            {books.map((book) => (
              <option key={book._id} value={book._id}>
                {book.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1 text-gray-700">Người nhập kho</label>
          <select
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none transition"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">-- Chọn người nhập --</option>
            <option value="admin">Admin</option>
            <option value="librarian">Thủ thư</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1 text-gray-700">Số lượng nhập</label>
          <input
            type="number"
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none transition"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 hover:shadow-md transition duration-200"
        >
          ✅ Thêm vào kho
        </button>
      </form>
    </div>
  );
};

export default ImportAdd;

