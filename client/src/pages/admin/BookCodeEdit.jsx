import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
const BookCodeEdit = () => {
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ category: "", prefix: "" });
  const navigate = useNavigate();
  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/category?limit=1000");
      setCategories(res.data.categories || res.data);
    } catch (err) {
      console.error("Lỗi lấy danh mục:", err);
    }
  };
  const fetchBookCode = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/bookcodes/${id}`);
      const data = res.data;
      setForm({ category: data.category._id, prefix: data.prefix });
    } catch (err) {
      console.error("Lỗi lấy BookCode:", err);
      alert("Không tìm thấy BookCode");
      navigate("/admin/bookcode");
    }
  };
  useEffect(() => {
    fetchCategories();
    fetchBookCode();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:5000/api/bookcodes/${id}`, { prefix: form.prefix });
      alert(res.data.message);
      navigate("/admin/bookcode");
    } catch (err) {
      console.error("Lỗi cập nhật BookCode:", err.response?.data || err);
      alert(err.response?.data?.message || "❌ Cập nhật thất bại!");
    }
  };
  return (
    <div className="max-w-2xl mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-semibold mb-6">Sửa BookCode</h2>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
        <select
          value={form.category}
          className="border p-3 rounded-lg bg-gray-200 cursor-not-allowed"
          disabled
        >
          <option value="">-- Chọn category --</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Mã sách"
          value={form.prefix}
          onChange={(e) => setForm({ ...form, prefix: e.target.value })}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          required
        />
        <button
          type="submit"
          className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-lg"
        >
          Cập nhật
        </button>
      </form>
    </div>
  );
};

export default BookCodeEdit;
