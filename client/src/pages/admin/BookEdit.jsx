import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Upload, BookOpen } from "lucide-react";

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
    bookCode: "",
  });
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [loadingCode, setLoadingCode] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, authorRes, bookRes] = await Promise.all([
          axios.get("http://localhost:5000/api/category?limit=1000"),
          axios.get("http://localhost:5000/api/authors?limit=1000"),
          axios.get(`http://localhost:5000/api/books/${id}`),
        ]);

        setCategories(catRes.data.categories || catRes.data);
        setAuthors(authorRes.data.authors || authorRes.data);

        const data = bookRes.data;
        setForm({
          title: data.title || "",
          description: data.description || "",
          category: data.category?._id || "",
          author: data.author?._id || "",
          publishedYear: data.publishedYear || "",
          quantity: data.quantity || 0,
          images: data.images || [],
          bookCode: data.bookCode?.code || "",
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [id]);
  useEffect(() => {
    const fetchBookCode = async () => {
      if (!form.category)
        return setForm((prev) => ({ ...prev, bookCode: "" }));
      setLoadingCode(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/bookcodes/category/${form.category}`
        );
        if (res.data) {
          const { prefix, lastNumber } = res.data;
          const nextCode = `${prefix}-${String(lastNumber + 1).padStart(
            3,
            "0"
          )}`;
          setForm((prev) => ({ ...prev, bookCode: nextCode }));
        }
      } catch (err) {
        console.error(err);
        setForm((prev) => ({ ...prev, bookCode: "⚠️ Lỗi" }));
      } finally {
        setLoadingCode(false);
      }
    };
    fetchBookCode();
  }, [form.category]);

  const handleFileChange = (e) => setNewFiles(Array.from(e.target.files));
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.title ||
      !form.category ||
      (!newFiles.length && !form.images.length) ||
      !form.publishedYear
    ) {
      alert("⚠️ Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    const dataToSend = {
      ...form,
      available: form.quantity,
    };

    const formData = new FormData();
    Object.entries(dataToSend).forEach(([key, value]) =>
      formData.append(key, value)
    );
    if (newFiles.length > 0) {
      newFiles.forEach((file) => formData.append("images", file));
    } else if (form.images.length > 0) {
      formData.append("images", JSON.stringify(form.images));
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/books/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert(res.data.message || "✅ Cập nhật sách thành công!");
      navigate("/admin/bookmanager", {
        state: { updatedBook: res.data.book },
      });
    } catch (err) {
      console.error(err);
      alert("❌ Cập nhật thất bại!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl border border-gray-200">
      <h2 className="text-3xl font-bold text-blue-600 mb-6 text-center">
        Sửa Sách
      </h2>

      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        onSubmit={handleSubmit}
      >
        <div className="relative">
          <BookOpen className="absolute top-3 left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Tên sách *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="pl-10 border rounded-lg w-full py-3 focus:ring-2 focus:ring-blue-400 outline-none"
            required
          />
        </div>
        <select
          value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })}
          className="border rounded-lg w-full py-3 px-4 focus:ring-2 focus:ring-blue-400 outline-none"
        >
          <option value="">-- Chọn tác giả --</option>
          {authors.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Năm xuất bản *"
          value={form.publishedYear}
          onChange={(e) =>
            setForm({ ...form, publishedYear: e.target.value })
          }
          className="border rounded-lg w-full py-3 px-4 focus:ring-2 focus:ring-blue-400 outline-none"
          required
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="border rounded-lg w-full py-3 px-4 focus:ring-2 focus:ring-blue-400 outline-none"
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
          value={loadingCode ? "Đang tải..." : form.bookCode}
          readOnly
          className="md:col-span-2 border rounded-lg w-full py-3 px-4 bg-gray-100 text-gray-600"
          placeholder="Mã sách tự sinh"
        />
        <input
          type="number"
          placeholder="Số lượng *"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          className="border rounded-lg w-full py-3 px-4 focus:ring-2 focus:ring-blue-400 outline-none"
          required
        />
        <textarea
          placeholder="Mô tả"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="md:col-span-2 border rounded-lg w-full py-3 px-4 focus:ring-2 focus:ring-blue-400 outline-none resize-none h-32"
        />
        <div className="md:col-span-2 flex flex-col gap-2">
          <label className="font-medium flex items-center gap-2">
            <Upload className="text-gray-500" /> Ảnh sách
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
          />
          <div className="flex flex-wrap gap-3 mt-2">
            {(newFiles.length ? newFiles : form.images).map((img, idx) => (
              <img
                key={idx + (img.name || img)}
                src={
                  img instanceof File
                    ? URL.createObjectURL(img)
                    : img.startsWith("http")
                    ? img
                    : `http://localhost:5000${img}`
                }
                alt="book"
                className="w-24 h-32 object-cover rounded-lg border"
              />
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold transition-all flex justify-center items-center gap-2"
        >
          Cập nhật sách
        </button>
      </form>
    </div>
  );
};

export default BookEdit;
