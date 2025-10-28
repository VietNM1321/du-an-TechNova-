import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddAuthor = () => {
  const [form, setForm] = useState({
    name: "",
    bio: "",
    dateOfBirth: "",
    dateOfDeath: "",
    image: null,
  });

  const navigate = useNavigate();
  const API = "http://localhost:5000/api/authors";

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach((key) => formData.append(key, form[key]));
    await axios.post(API, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    alert("✅ Thêm tác giả thành công!");
    navigate("/admin/author");
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg mt-10">
      <h2 className="text-3xl font-bold text-blue-700 mb-8 text-center">
        ➕ Thêm Tác Giả Mới
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-1">
            Tên tác giả <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            placeholder="Nhập tên tác giả"
            value={form.name}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-1">Ảnh tác giả</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-1">Ngày sinh</label>
          <input
            type="date"
            name="dateOfBirth"
            value={form.dateOfBirth}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-1">Ngày mất</label>
          <input
            type="date"
            name="dateOfDeath"
            value={form.dateOfDeath}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2"
          />
        </div>
        <div className="flex flex-col md:col-span-2">
          <label className="font-semibold text-gray-700 mb-1">Tiểu sử</label>
          <textarea
            name="bio"
            placeholder="Nhập tiểu sử, mô tả ngắn về tác giả..."
            value={form.bio}
            onChange={handleChange}
            rows="5"
            className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div className="md:col-span-2 flex justify-center">
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-800 transition-all"
          >
            💾 Lưu tác giả
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAuthor;
