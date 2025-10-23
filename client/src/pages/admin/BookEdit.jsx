import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const BookEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    images: [],
    category: "",
    author: "",
    publishedYear: "",
    quantity: "",
    available: "",
  });

  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/category?limit=1000");
        setCategories(res.data.categories || res.data);
      } catch (err) {
        console.error("Lỗi tải danh mục:", err);
        setCategories([]);
      }
    };
    const fetchAuthors = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/authors?limit=1000");
        const data = Array.isArray(res.data.authors || res.data)
          ? res.data.authors || res.data
          : [];
        setAuthors(data);
      } catch (err) {
        console.error("Lỗi lấy tác giả:", err);
        setAuthors([]);
      }
    };
    const fetchBook = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/books/${id}`);
        setForm({
          title: res.data.title,
          description: res.data.description,
          category: res.data.category?._id || "",
          author: res.data.author?._id || "",
          publishedYear: res.data.publishedYear || "",
          quantity: res.data.quantity || 0,
          available: res.data.available || 0,
          images: res.data.images || [],
        });
      } catch (err) {
        console.error("Lỗi lấy sách:", err);
      }
    };

    fetchCategories();
    fetchAuthors();
    fetchBook();
  }, [id]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.category || (!newFiles.length && !form.images.length) || !form.publishedYear) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("category", form.category);
    if (form.author) formData.append("author", form.author);
    formData.append("publishedYear", form.publishedYear);
    formData.append("quantity", form.quantity || 0);
    formData.append("available", form.available || 0);
    formData.append("description", form.description);

    newFiles.forEach(file => formData.append("images", file));
    if (!newFiles.length && form.images.length) {
      form.images.forEach(url => formData.append("images", url));
    }

    try {
      await axios.put(`http://localhost:5000/api/books/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ Cập nhật sách thành công!");
      navigate("/admin/bookmanager");
    } catch (err) {
      console.error("Lỗi cập nhật sách:", err.response?.data || err);
      alert("❌ Cập nhật sách thất bại!");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-semibold mb-6">Sửa sách</h2>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Tên sách *"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          required
        />

        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
        />

        <select
          value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
        >
          <option value="">-- Chọn tác giả --</option>
          {authors.map((a) => (
            <option key={a._id} value={a._id}>{a.name}</option>
          ))}
        </select>

        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          required
        >
          <option value="">-- Chọn thể loại *--</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Năm xuất bản *"
          value={form.publishedYear}
          onChange={(e) => setForm({ ...form, publishedYear: e.target.value })}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          required
        />

        <input
          type="number"
          placeholder="Số lượng"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
        />

        <input
          type="number"
          placeholder="Còn lại"
          value={form.available}
          onChange={(e) => setForm({ ...form, available: e.target.value })}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
        />

        <textarea
          placeholder="Mô tả"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border p-3 rounded-lg md:col-span-2 focus:ring-2 focus:ring-blue-400 outline-none"
        />

        <div className="md:col-span-2 flex flex-col gap-2">
          <label className="font-medium">Ảnh hiện tại:</label>
          <div className="flex gap-2 flex-wrap">
            {form.images.map((img, idx) => (
            <img
                key={idx}
                src={img.startsWith("http") ? img : `http://localhost:5000${img}`}
                alt="book"
                className="w-20 h-28 object-cover rounded"
            />
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg"
        >
          Cập nhật sách
        </button>
      </form>
    </div>
  );
};

export default BookEdit;
