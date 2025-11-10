import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const EditAuthor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API = "http://localhost:5000/api/authors";
  const [form, setForm] = useState({ // khai báo form lưu dữ liệu
    name: "",
    bio: "",
    dateOfBirth: "",
    dateOfDeath: "",
    image: null,
    currentImage: "",
  });
  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/authors/${id}`);
        const data = res.data;
        setForm({
          name: data.name,
          bio: data.bio || "",
          dateOfBirth: data.dateOfBirth
            ? data.dateOfBirth.split("T")[0]
            : "",
          dateOfDeath: data.dateOfDeath
            ? data.dateOfDeath.split("T")[0]
            : "",
          image: null,
          currentImage: data.image || "",
        });
      } catch (err) {
        console.error("❌ Lỗi lấy dữ liệu tác giả:", err);
        alert("Không thể tải dữ liệu tác giả!");
        navigate("/admin/author");
      }
    };
    fetchAuthor();
  }, [id, navigate]);
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("bio", form.bio);
    formData.append("dateOfBirth", form.dateOfBirth);
    formData.append("dateOfDeath", form.dateOfDeath);
    if (form.image) formData.append("image", form.image);

    try {
      await axios.put(`http://localhost:5000/api/authors/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ Cập nhật tác giả thành công!");
      navigate("/admin/author");
    } catch (err) {
      console.error("❌ Lỗi cập nhật tác giả:", err);
      alert("Không thể cập nhật tác giả!");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg mt-10">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">
        ✏️ Chỉnh sửa tác giả
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-600">
            Tên tác giả
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-600">
            Ảnh tác giả
          </label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
          {form.currentImage && (
            <img
              src={`http://localhost:5000/${form.currentImage}`}
              alt="Ảnh hiện tại"
              className="mt-2 w-24 h-24 object-cover rounded-full border mx-auto"
            />
          )}
        </div>
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-600">
            Ngày sinh
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={form.dateOfBirth}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-600">
            Ngày mất
          </label>
          <input
            type="date"
            name="dateOfDeath"
            value={form.dateOfDeath}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block mb-1 text-sm font-semibold text-gray-600">
            Tiểu sử / mô tả chi tiết
          </label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows="4"
            className="w-full border border-gray-300 rounded-lg p-2"
          ></textarea>
        </div>

        <div className="md:col-span-2 flex justify-between mt-4">
          <button
            type="button"
            onClick={() => navigate("/admin/author")}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
          >
            ⬅️ Quay lại
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            💾 Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAuthor;
