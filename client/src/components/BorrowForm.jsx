import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../components/cart";
import { message } from "antd";

const BorrowForm = ({ book, onClose }) => {
  const { addToCart } = useCart();
  const user = JSON.parse(localStorage.getItem("clientUser")) || {};
  const isAdmin = user.role === "admin";
  const derivedStudentId = user.studentId || user.studentCode || "";
  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    studentId: derivedStudentId,
    email: user.email || "",
    borrowDate: "",
    returnDate: "",
  });
  useEffect(() => {
    const ensureStudentId = async () => {
      if (formData.studentId || isAdmin) return;
      const latestUser = JSON.parse(localStorage.getItem("clientUser")) || {};
      const token = localStorage.getItem("clientToken");
      const userId = latestUser?._id || latestUser?.id;
      if (!token || !userId) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/api/users/${userId}/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const fetchedCode = res.data?.user?.studentCode || "";
        if (fetchedCode) {
          const updatedUser = {...latestUser,studentCode: fetchedCode,studentId: fetchedCode,};
          localStorage.setItem("clientUser", JSON.stringify(updatedUser));
          setFormData((prev) => ({ ...prev, studentId: fetchedCode }));
        }
      } catch (error) {
        console.error("❌ Không lấy được mã sinh viên:", error);
      }
    };
    ensureStudentId();
  }, [formData.studentId]);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isAdmin) {
        message.error("Tài khoản quản trị không thể mượn sách.");
        return;
      }
      const borrowDate = new Date(formData.borrowDate);
      const returnDate = new Date(formData.returnDate);
      if (borrowDate < new Date().setHours(0, 0, 0, 0)) {
        message.error("Ngày mượn không thể là ngày trong quá khứ!");
        return;
      }
      if (returnDate <= borrowDate) {
        message.error("Ngày trả phải lớn hơn ngày mượn!");
        return;
      }
      const daysDiff = Math.floor((returnDate - borrowDate) / (1000 * 60 * 60 * 24));
      if (daysDiff > 30) {
        message.error("Thời gian mượn không được quá 30 ngày!");
        return;
      }
      await addToCart({
        bookId: book._id,
        quantity: 1,
        ...formData,
        borrowDate: formData.borrowDate,
        returnDate: formData.returnDate
      });
      message.success("✅ Sách đã thêm vào giỏ hàng!");
      onClose();
    } catch (error) {
      console.error("Lỗi khi mượn sách:", error);
      const errorMessage = error.message || "❌ Mượn sách thất bại.";
      message.error(errorMessage, 5);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl ring-1 ring-slate-100 p-6 mx-4">
        <button
          aria-label="Đóng"
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-700 transition"
        >
          ✕
        </button>

        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            📚 Thông tin mượn sách
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {book?.title}
          </p>
          {book?.Pricebook !== undefined && (
            <p className="text-sm text-rose-600 mt-2">
              Giá đền bù dự kiến:{" "}
              <span className="font-semibold">
                {(book.Pricebook ?? 0).toLocaleString("vi-VN")} VNĐ
              </span>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700">Họ và tên</label>
            <input
              type="text"
              name="fullName"
              placeholder="Họ và tên"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Mã sinh viên</label>
            <input
              type="text"
              name="studentId"
              placeholder="Mã sinh viên"
              value={formData.studentId}
              readOnly
              aria-readonly="true"
              className="mt-1 w-full border border-slate-300 rounded-lg p-2.5 bg-slate-100 text-slate-700 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">Mã sinh viên được lấy theo tài khoản đăng nhập.</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Ngày mượn</label>
              <input
                type="date"
                name="borrowDate"
                value={formData.borrowDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className="mt-1 w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Ngày trả</label>
              <input
                type="date"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleChange}
                min={formData.borrowDate || new Date().toISOString().split('T')[0]}
                required
                className="mt-1 w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center items-center gap-2 border border-slate-300 px-4 py-2.5 rounded-lg hover:bg-slate-50 transition font-medium"
            >
              Quay lại
            </button>
            <button
              type="submit"
              className="inline-flex justify-center items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition font-semibold shadow-sm"
            >
              ✅ Mượn sách
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BorrowForm;

