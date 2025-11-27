import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
const EditCategory = () => {
  const [form, setForm] = useState({ name: "", description: "" });
  const { id } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/category/${id}`);
        setForm({ name: res.data.name, description: res.data.description });
      } catch (err) {
        console.error(err);
        alert("❌ Lỗi khi tải danh mục!");
      }
    };
    fetchCategory();
  }, [id]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/category/${id}`, form);
      alert("✅ Cập nhật thành công!");
      navigate("/admin/category");
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi cập nhật!");
    }
  };
  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white shadow-lg rounded-xl p-8">
      <h2 className="text-2xl font-bold text-yellow-600 mb-6 text-center">
        ✏️ Sửa danh mục
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-semibold mb-1 text-gray-700">
            Tên danh mục
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400"
          />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1 text-gray-700">
            Mô tả
          </label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400"
          />
        </div>
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate("/admin/category")}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
          >
            ⬅️ Quay lại
          </button>
          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg"
          >
            Cập nhật
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCategory;
