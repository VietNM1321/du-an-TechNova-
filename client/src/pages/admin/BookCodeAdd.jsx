import React, { useEffect, useState } from "react";
import axios from "axios";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BookCodeAdd = () => {
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

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.prefix) {
      alert("Vui lòng chọn category và nhập mã sách!");
      return;
    }
    try {
<<<<<<< HEAD
      await axios.post("http://localhost:5000/api/bookcode", form);
=======
      await axios.post("http://localhost:5000/api/bookcodes", form);
>>>>>>> origin/main
      alert("✅ Thêm BookCode thành công!");
      navigate("/admin/bookcode");
    } catch (err) {
      console.error("Lỗi thêm BookCode:", err.response?.data || err);
      alert("❌ Thêm thất bại đã có mã!");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-semibold mb-6">Thêm BookCode mới</h2>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          required
        >
          <option value="">-- Chọn category --</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Mã sách (VD: FIC, NF)"
          value={form.prefix}
          onChange={(e) => setForm({ ...form, prefix: e.target.value })}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex justify-center items-center gap-2"
        >
          <PlusCircle size={20} /> Thêm mới
        </button>
      </form>
    </div>
  );
};

export default BookCodeAdd;
