import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ImportAdd = () => {
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBook, setSelectedBook] = useState("");
  const [quantity, setQuantity] = useState("");

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

  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    setBooks([]);
    setSelectedBook("");

    if (!categoryId) return;

    try {
      const res = await axios.get(`http://localhost:5000/api/books?limit=1000&category=${categoryId}`);
      setBooks(res.data.books);
    } catch (err) {
      toast.error("Không tìm thấy sách trong danh mục này");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBook || !quantity) {
      toast.warn("Vui lòng chọn sách và nhập số lượng!");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/imports", {
        bookId: selectedBook,
        quantity: Number(quantity),
      });
      toast.success("✅ Nhập kho thành công!");
      setSelectedBook("");
      setQuantity("");
    } catch (err) {
      toast.error("Lỗi khi nhập kho!");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow-md rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4 text-center">📦 Nhập Sách Vào Kho</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Danh mục</label>
          <select
            className="w-full border rounded-lg p-2"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Chọn sách</label>
          <select
            className="w-full border rounded-lg p-2"
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
          <label className="block font-medium mb-1">Số lượng nhập</label>
          <input
            type="number"
            className="w-full border rounded-lg p-2"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Thêm vào kho
        </button>
      </form>
    </div>
  );
};

export default ImportAdd;
