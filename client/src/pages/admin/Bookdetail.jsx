import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [imports, setImports] = useState([]);
  const [borrowCount, setBorrowCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookRes = await axios.get(`http://localhost:5000/api/books/${id}`);
        setBook(bookRes.data);
        setImports(bookRes.data.imports || []); 
        setBorrowCount(bookRes.data.borrowCount || 0);
      } catch (err) {
        console.error("❌ Lỗi khi lấy dữ liệu chi tiết:", err);
      }
    };
    fetchData();
  }, [id]);

  if (!book) return <div className="p-8 text-center">⏳ Đang tải dữ liệu...</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 mt-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">
        📘 Chi tiết sách: {book.title}
      </h2>

      <div className="flex gap-6">
        <img
            src={book.images?.[0]}
            alt={book.title}
            className="w-48 h-64 object-cover rounded-lg shadow-lg"
        />
        <div className="flex-1 flex flex-col justify-start gap-2">
            <p className="text-gray-700 text-lg"><span className="font-semibold">Mã sách:</span> <span className="text-blue-700">{book.code}</span></p>
            <p className="text-gray-700 text-lg"><span className="font-semibold">Tên sách:</span> <span className="text-blue-700">{book.title}</span></p>
            <p className="text-gray-700 text-lg"><span className="font-semibold">Thể loại:</span> {book.category?.name || "—"}</p>
            <p className="text-gray-700 text-lg"><span className="font-semibold">Tác giả:</span> {book.author?.name || "—"}</p>
            <p className="text-gray-700 text-lg"><span className="font-semibold">Năm xuất bản:</span> {book.publishedYear || "—"}</p>
            <p className="text-gray-700 text-lg"><span className="font-semibold">Số lượng hiện có:</span> <span className="text-green-600 font-bold">{book.available}</span> / {book.quantity}</p>
            <p className="text-gray-500 text-base"><span className="font-semibold">Ngày thêm sách:</span> {new Date(book.createdAt).toLocaleDateString("vi-VN")}</p>
        </div>
        </div>

        <hr className="my-6" />
        <h3 className="text-lg font-semibold text-gray-800 mb-3">📦 Lịch sử nhập kho</h3>
        {imports.length > 0 ? (
        <div className="space-y-3">
            {imports.map((imp) => {
              const role = imp.user?.role?.toLowerCase().trim();
              const roleLabel = role === "admin" ? "Admin" : role ? "Thủ thư" : "Admin";
              const fullName = imp.user?.fullName && imp.user.fullName !== "Chưa cập nhật"
                ? imp.user.fullName
                : null;
              const displayUser = imp.userLabel
                ? imp.userLabel
                : imp.user
                ? fullName
                  ? `${fullName} (${roleLabel})`
                  : roleLabel
                : roleLabel;
              return (
            <div
                key={imp._id}
                className="p-4 border rounded-lg shadow-sm flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition"
            >
                <div>
                <p className="text-gray-700"><strong>Ngày nhập:</strong> {new Date(imp.createdAt).toLocaleDateString("vi-VN")}</p>
                <p className="text-gray-700"><strong>Người nhập:</strong> {displayUser}</p>
                </div>
                <div className="text-blue-700 font-bold text-lg">{imp.quantity}</div>
            </div>
            );})}
        </div>
        ) : (
        <p className="text-gray-500 italic">Chưa có lần nhập kho nào cho sách này.</p>
        )}

      <hr className="my-6" />
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">📖 Thống kê mượn sách</h3>
        <p>
          Số lượt mượn: <span className="font-bold text-blue-700">{borrowCount}</span>
        </p>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
        >
          ⬅ Quay lại
        </button>
      </div>
    </div>
  );
};

export default BookDetail;
          
