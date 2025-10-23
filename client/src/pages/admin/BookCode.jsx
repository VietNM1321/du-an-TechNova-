import React, { useEffect, useState } from "react";
import axios from "axios";

const BookCode = () => {
  const [bookCodes, setBookCodes] = useState([]);
  const fetchBookCodes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bookcode");
      setBookCodes(res.data.bookcodes || res.data);
    } catch (err) {
      console.error("Lỗi lấy BookCode:", err);
      setBookCodes([]);
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa BookCode này?")) {
      try {
        const res = await axios.delete(`http://localhost:5000/api/bookcode/${id}`);
        alert(res.data.message || "✅ Xóa thành công!");
        fetchBookCodes();
      } catch (err) {
        alert(
          err.response?.data?.message ||
          "❌ Không thể xóa BookCode. Do BookCode đang có sách!"
        );
      }
    }
  };

  useEffect(() => {
    fetchBookCodes();
  }, []);

  return (
    <div className="max-w-5xl mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Danh sách BookCode</h2>
        <button
          onClick={() => window.location.href = "/admin/bookcodeadd"}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
        >
          ➕ Thêm BookCode
        </button>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
        <table className="min-w-full">
          <thead className="bg-blue-50 text-blue-800">
            <tr>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Code</th>
              <th className="p-3 text-left">Last Number</th>
              <th className="p-3 text-center">Hành động</th>
            </tr> 
          </thead>
          <tbody>
            {bookCodes.map((b, i) => (
              <tr
                key={b._id}
                className={`border-t border-gray-100 ${
                  i % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-blue-50 transition`}
              >
                <td className="p-3">{b.category?.name || "—"}</td>
                <td className="p-3 font-mono">{b.prefix}</td>
                <td className="p-3">{b.lastNumber}</td>
                <td className="p-3 text-center flex justify-center gap-2">
                  <button
                    onClick={() => window.location.href = `/admin/bookcode/edit/${b._id}`}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg"
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(b._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                  >
                    🗑️ Xóa
                  </button>
                </td>
              </tr>
            ))}
            {bookCodes.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500 italic">
                  📭 Chưa có BookCode nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookCode;
