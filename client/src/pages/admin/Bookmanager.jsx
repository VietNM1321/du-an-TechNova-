import React, { useEffect, useState } from "react";
import axios from "axios";
import { BookOpen, PlusCircle, Edit, Trash2 } from "lucide-react";

const BookManager = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    images: "",
    category: "",
    author: "",
    publisher: "",
    publishedYear: "",
    quantity: "",
    available: "",
  });

  // Goi API 
  const fetchBooks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/books");
      setBooks(res.data);
    } catch (err) {
      console.error("Lỗi lấy sách:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/category");
      setCategories(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh mục:", err);
    }
  };

  const fetchAuthors = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/author");
      setAuthors(res.data);
    } catch (err) {
      console.error("Lỗi lấy tác giả:", err);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchCategories();
    fetchAuthors();
  }, []);
  // day la phan validate yeu cau nhap thong tin
  const handleSubmit = async (e) => {
  e.preventDefault();
  const imagesArr = form.images.split(",").map(i => i.trim()).filter(Boolean);
  if (!form.title || imagesArr.length === 0 || !form.publishedYear || !form.category) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  const data = {
    ...form,
    images: imagesArr,
    publishedYear: Number(form.publishedYear),
    quantity: Number(form.quantity) || 0,
    available: Number(form.available) || 0,
  };

  if (!form.publisher) {
    delete data.publisher;
  }

  if (!form.author) {
    delete data.author;
  }

  try {
    if (editId) {
      await axios.put(`http://localhost:5000/api/books/${editId}`, data);
      alert("✅ Cập nhật thành công!");
    } else {
      await axios.post("http://localhost:5000/api/books", data);
      alert("✅ Thêm thành công!");
    }

    setForm({
      title: "",
      description: "",
      images: "",
      category: "",
      author: "",
      publisher: "",
      publishedYear: "",
      quantity: "",
      available: "",
    });
    setEditId(null);
    fetchBooks();
  } catch (err) {
    console.error("Lỗi khi gửi lên server:", err.response?.data || err);
    alert("❌ Thất bại khi lưu!");
  }
};

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

  const handleEdit = (book) => {
    setForm({
      title: book.title,
      description: book.description || "",
      images: Array.isArray(book.images) ? book.images.join(", ") : "",
      category: book.category?._id || "",
      author: book.author?._id || "",
      publisher: book.publisher?._id || "",
      publishedYear: book.publishedYear || "",
      quantity: book.quantity || 0,
      available: book.available || 0,
    });
    setEditId(book._id);
  };

  return (
    <div className="max-w-6xl mx-auto bg-gradient-to-b from-gray-50 to-white p-8 rounded-2xl shadow-lg mt-12 border border-gray-200">
      <div className="flex items-center justify-center gap-3 mb-8">
        <BookOpen className="text-blue-700 w-8 h-8" />
        <h2 className="text-3xl font-semibold text-gray-800">Quản lý Sách</h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-10"
      >
        <input
          className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder="Tên sách"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <input
          className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder="Ảnh (ngăn cách bằng dấu ,)"
          value={form.images}
          onChange={(e) => setForm({ ...form, images: e.target.value })}
          required
        />

        <select
          className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })}
        >
          <option value="">-- Chọn tác giả --</option>
          {authors.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name}
            </option>
          ))}
        </select>

        <select
          className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="">-- Chọn thể loại --</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder="Năm xuất bản"
          value={form.publishedYear}
          onChange={(e) => setForm({ ...form, publishedYear: e.target.value })}
        />
        <input
          className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder="Số lượng"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        />
        <input
          className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder="Còn lại"
          value={form.available}
          onChange={(e) => setForm({ ...form, available: e.target.value })}
        />

        <textarea
          className="border border-gray-300 p-3 rounded-lg md:col-span-2 focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder="Mô tả"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button
          type="submit"
          className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex justify-center items-center gap-2 transition"
        >
          <PlusCircle size={20} />
          {editId ? "Cập nhật sách" : "Thêm sách mới"}
        </button>
      </form>

      <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
        <table className="min-w-full">
          <thead className="bg-blue-50 text-blue-800">
            <tr>
              <th className="p-3 text-left">Ảnh</th>
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
                <td className="p-3">{b.title}</td>
                <td className="p-3">{b.category?.name || "—"}</td>
                <td className="p-3">{b.author?.name || "—"}</td>
                <td className="p-3 text-center">{b.publishedYear}</td>
                <td className="p-3 text-center">{b.quantity}</td>
                <td className="p-3 text-center">{b.available}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleEdit(b)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg flex items-center gap-1 inline-flex"
                  >
                    <Edit size={16} /> Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(b._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg ml-2 flex items-center gap-1 inline-flex"
                  >
                    <Trash2 size={16} /> Xóa
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

export default BookManager;
