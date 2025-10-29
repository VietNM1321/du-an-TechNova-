import React, { useState, useEffect } from "react";
import { useCart } from "../components/cart";

const BorrowForm = ({ book, onClose }) => {
  const { addToCart } = useCart();

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    studentId: user.studentId || "",
    email: user.email || "",
    borrowDate: "",
    returnDate: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const borrowDate = new Date(formData.borrowDate);
      const returnDate = new Date(formData.returnDate);
      if (borrowDate < new Date().setHours(0, 0, 0, 0)) {
        alert("Ngày mượn không thể là ngày trong quá khứ!");
        return;
      }
      if (returnDate <= borrowDate) {
        alert("Ngày trả phải lớn hơn ngày mượn!");
        return;
      }
      const daysDiff = Math.floor((returnDate - borrowDate) / (1000 * 60 * 60 * 24));
      if (daysDiff > 30) {
        alert("Thời gian mượn không được quá 30 ngày!");
        return;
      }

      await addToCart({
        bookId: book._id,
        quantity: 1,
        ...formData,
        borrowDate: formData.borrowDate,
        returnDate: formData.returnDate
      });
      alert("✅ Sách đã thêm vào giỏ hàng!");
      onClose();
    } catch (error) {
      console.error("Lỗi khi mượn sách:", error);
      alert("❌ Mượn sách thất bại.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold text-blue-700 mb-4 text-center flex items-center justify-center gap-2">
          📚 Thông tin mượn sách
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="fullName"
            placeholder="Họ và tên"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full border rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="studentId"
            placeholder="Mã sinh viên"
            value={formData.studentId}
            onChange={handleChange}
            required
            className="w-full border rounded-md p-2 bg-gray-100 text-gray-700"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-3">
            <input
              type="date"
              name="borrowDate"
              value={formData.borrowDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
              className="flex-1 border rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              name="returnDate"
              value={formData.returnDate}
              onChange={handleChange}
              min={formData.borrowDate || new Date().toISOString().split('T')[0]}
              required
              className="flex-1 border rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-between mt-4 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 rounded-md transition-all"
            >
              Quay lại
            </button>
            <button
              type="submit"
              className="w-1/2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-md transition-all"
            >
              Mượn sách
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BorrowForm;
