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
        alert("Cập nhật tác giả thành công!");
      } else {
        await axios.post("http://localhost:5000/api/authors", form);
        alert("Thêm tác giả thành công!");
      }
      setForm({ name: "", bio: "" });
      setEditId(null);
      fetchAuthors();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu tác giả!");
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
    <div style={{ maxWidth: "800px", margin: "50px auto" }}>
      <h2>👨‍💼 Quản lý tác giả</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
        <input
          type="text"
          placeholder="Tên tác giả"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          style={{ padding: "8px", width: "60%", marginRight: "10px" }}
        />
        <input
          type="text"
          placeholder="Tiểu sử tác giả"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          style={{ padding: "8px", width: "60%", marginTop: "10px" }}
        />
        <button type="submit" style={{ backgroundColor: "#007bff", color: "white", marginLeft: "10px", padding: "8px 16px", border: "none", borderRadius: "4px" }}>
          {editId ? "Cập nhật" : "Thêm mới"}
        </button>
      </form>

      <table border="1" width="100%" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th>Tên tác giả</th>
            <th>Tiểu sử</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {authors.map((a) => (
            <tr key={a._id}>
              <td>{a.name}</td>
              <td>{a.bio}</td>
              <td>
                <button onClick={() => handleEdit(a)} style={{ backgroundColor: "orange", color: "white", marginRight: "10px" }}>
                  Sửa
                </button>
                <button onClick={() => handleDelete(a._id)} style={{ backgroundColor: "red", color: "white" }}>
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

export default AuthorManager;
