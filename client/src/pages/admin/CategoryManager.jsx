import React, { useEffect, useState } from "react";
import axios from "axios";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editId, setEditId] = useState(null);

  // 🧠 Lấy danh sách thể loại
  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Lỗi lấy thể loại:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 📌 Thêm hoặc cập nhật thể loại
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/categories/${editId}`, form);
        alert("✅ Cập nhật thể loại thành công!");
      } else {
        await axios.post("http://localhost:5000/api/categories", form);
        alert("✅ Thêm thể loại thành công!");
      }
      setForm({ name: "", description: "" });
      setEditId(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert("❌ Thao tác thất bại!");
    }
  };

  // 🗑️ Xóa thể loại
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa thể loại này?")) {
      try {
        await axios.delete(`http://localhost:5000/categories/${id}`);
        alert("🗑️ Xóa thành công!");
        fetchCategories();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // ✏️ Sửa thể loại
  const handleEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description });
    setEditId(cat._id);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "50px auto" }}>
      <h2>📚 Quản lý thể loại sách</h2>

      {/* Form thêm/sửa thể loại */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
        <input
          type="text"
          placeholder="Tên thể loại"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          style={{ padding: "8px", width: "60%", marginRight: "10px" }}
        />
        <input
          type="text"
          placeholder="Mô tả thể loại"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          style={{
            padding: "8px",
            width: "60%",
            marginRight: "10px",
            marginTop: "10px",
          }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: "#007bff",
            color: "#fff",
            padding: "8px 16px",
            border: "none",
            cursor: "pointer",
            borderRadius: "4px",
            marginLeft: "10px",
          }}
        >
          {editId ? "Cập nhật" : "Thêm mới"}
        </button>
      </form>

      {/* Bảng danh sách thể loại */}
      <table border="1" width="100%" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th>Tên thể loại</th>
            <th>Mô tả</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat._id}>
              <td>{cat.name}</td>
              <td>{cat.description}</td>
              <td>
                <button
                  onClick={() => handleEdit(cat)}
                  style={{
                    backgroundColor: "orange",
                    color: "white",
                    marginRight: "10px",
                  }}
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  style={{ backgroundColor: "red", color: "white" }}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryManager;
