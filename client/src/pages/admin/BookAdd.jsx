import React, { useEffect, useState } from "react";
import axios from "axios";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BookAdd = () => {
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

  const [bookCode, setBookCode] = useState("");
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

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

    fetchCategories();
    fetchAuthors();
  }, []);
  useEffect(() => {
    const fetchBookCode = async () => {
      if (!form.category) {
        setBookCode("");
        return;
      }
      try {
        const res = await axios.get(`http://localhost:5000/api/bookcode/${form.category}`);
        const { prefix, lastNumber } = res.data;
        setBookCode(`${prefix}-${String(lastNumber + 1).padStart(3, "0")}`);
      } catch (err) {
        console.error("Lỗi lấy mã sách:", err);
        setBookCode("");
      }
    };
    fetchBookCode();
  }, [form.category]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category || selectedFiles.length === 0 || !form.publishedYear) {
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

    selectedFiles.forEach((file, index) => {
      formData.append("images", file);
    });

    try {
      await axios.post("http://localhost:5000/api/books", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ Thêm sách thành công!");
      navigate("/admin/bookmanager");
    } catch (err) {
      console.error("Lỗi thêm sách:", err.response?.data || err);
      alert("❌ Thêm sách thất bại!");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-semibold mb-6">Thêm sách mới</h2>
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
          required
        />

        <select
          value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
        >
          <option value="">-- Chọn tác giả --</option>
          {authors.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name}
            </option>
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
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={bookCode}
          placeholder="Mã sách sẽ tự sinh"
          className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          readOnly
        />

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
        <button
          type="submit"
          className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex justify-center items-center gap-2"
        >
          <PlusCircle size={20} /> Thêm sách
        </button>
      </form>
    </div>
  );
};

export default BookAdd;
