import React, { useEffect, useState } from "react";
import axios from "axios";

const AuthorManager = () => {
  const [authors, setAuthors] = useState([]);
  const [form, setForm] = useState({ name: "", bio: "" });
  const [editId, setEditId] = useState(null);

  const fetchAuthors = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/authors");
      setAuthors(res.data);
    } catch (err) {
      console.error("Lỗi lấy tác giả:", err);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/authors/${editId}`, form);
        alert("✅ Cập nhật tác giả thành công!");
      } else {
        await axios.post("http://localhost:5000/api/authors", form);
        alert("✅ Thêm tác giả thành công!");
      }
      setForm({ name: "", bio: "" });
      setEditId(null);
      fetchAuthors();
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi lưu tác giả!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa tác giả này?")) {
      try {
        await axios.delete(`http://localhost:5000/api/authors/${id}`);
        fetchAuthors();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEdit = (author) => {
    setForm({ name: author.name, bio: author.bio });
    setEditId(author._id);
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-lg mt-10">
      <h2 className="text-3xl font-bold text-blue-700 text-center mb-8">
        ✍️ Quản lý Tác giả
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10"
      >
        <input
          type="text"
          placeholder="Tên tác giả"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
        />
        <input
          type="text"
          placeholder="Tiểu sử / mô tả ngắn"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
        />
      <button
        type="submit"
        className="col-span-1 md:col-span-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-2 rounded-lg shadow-md transition-all"
        >
        {editId ? "Cập nhật tác giả" : "Thêm tác giả mới"}
      </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-blue-100 text-blue-800">
            <tr>
              <th className="p-3 border">Tên tác giả</th>
              <th className="p-3 border">Tiểu sử</th>
              <th className="p-3 border text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {authors.map((a, index) => (
              <tr
                key={a._id}
                className={`hover:bg-gray-50 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className="p-3 border text-gray-800 font-medium">
                  👤 {a.name}
                </td>
                <td className="p-3 border text-gray-600 italic">{a.bio}</td>
                <td className="p-3 border text-center">
                  <button
                    onClick={() => handleEdit(a)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded mr-2 transition"
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(a._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
                  >
                    🗑️ Xóa
                  </button>
                </td>
              </tr>
            ))}
            {authors.length === 0 && (
              <tr>
                <td
                  colSpan="3"
                  className="text-center py-6 text-gray-500 italic"
                >
                  📭 Chưa có tác giả nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuthorManager;
