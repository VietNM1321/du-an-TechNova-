import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddCategory = () => {
  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form:", form);

    if (!form.name) {
      alert("❌ Tên danh mục không được để trống!");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/category", form);
      console.log("Response:", res.data);
      alert("✅ Thêm danh mục thành công!");
      navigate("/admin/category");
    } catch (err) {
      console.error("Create category error:", err.response?.data || err.message);
      alert("❌ Lỗi khi thêm danh mục! " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white shadow-lg rounded-xl p-8">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
        ➕ Thêm danh mục mới
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-semibold mb-1 text-gray-700">Tên danh mục</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            placeholder="Nhập tên danh mục..."
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1 text-gray-700">Mô tả</label>
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            placeholder="Nhập mô tả..."
          />
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate("/admin/category")}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
            disabled={loading}
          >
            ⬅️ Quay lại
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCategory;
