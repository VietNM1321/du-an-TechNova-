import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(() => {
    // ✅ Lấy sẵn user từ localStorage để hiển thị ngay
    const stored = localStorage.getItem("clientUser");
    return stored ? JSON.parse(stored) : null;
  });
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [reportType, setReportType] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const userData = JSON.parse(localStorage.getItem("clientUser"));
      if (!userData || !userData._id) {
        alert("Chưa đăng nhập!");
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:5000/api/users/${userData._id}/profile`
        );
        setUser(res.data);
        setBorrowedBooks(res.data.borrowings || []);
      } catch (error) {
        console.error("❌ Lỗi khi tải hồ sơ:", error);
        alert("Không thể tải hồ sơ, vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleReport = async () => {
    if (!reportType || !reason.trim())
      return alert("Vui lòng chọn loại báo cáo và nhập lý do!");

    try {
      await axios.post(
        `http://localhost:5000/api/users/${selectedBook._id}/report`,
        { type: reportType, reason }
      );
      alert("✅ Đã gửi báo cáo thành công!");
      setSelectedBook(null);
      setReportType("");
      setReason("");
    } catch (err) {
      console.error("❌ Lỗi gửi báo cáo:", err);
      alert("Không thể gửi báo cáo, vui lòng thử lại!");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={36} />
      </div>
    );

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Hồ sơ người dùng</h1>

      {user ? (
        <div className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-100">
          <p className="text-gray-700 text-lg">
            <strong>Mã sinh viên:</strong> {user.studentCode || "Không có"}
          </p>
          <p className="text-gray-700 text-lg mt-2">
            <strong>Email:</strong> {user.email || "Không có"}
          </p>
        </div>
      ) : (
        <p className="text-gray-500">Chưa có thông tin người dùng.</p>
      )}

      <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Danh sách sách đã mượn
        </h2>

        {borrowedBooks.length === 0 ? (
          <p className="text-gray-500 text-center">
            Bạn chưa mượn quyển sách nào.
          </p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm">
                <th className="p-3 text-left">Tên sách</th>
                <th className="p-3 text-left">Ngày mượn</th>
                <th className="p-3 text-left">Trạng thái</th>
                <th className="p-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {borrowedBooks.map((b) => (
                <tr key={b._id} className="border-t text-sm hover:bg-gray-50">
                  <td className="p-3">{b.book?.title || "Không xác định"}</td>
                  <td className="p-3">
                    {new Date(b.borrowDate).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        b.status === "borrowed"
                          ? "bg-blue-100 text-blue-600"
                          : b.status === "overdue"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {b.status === "borrowed"
                        ? "Đang mượn"
                        : b.status === "overdue"
                        ? "Trễ hạn"
                        : "Đã trả / hỏng"}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedBook(b)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1 rounded-lg"
                    >
                      Báo mất / hỏng
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AnimatePresence>
        {selectedBook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 w-96 shadow-xl"
            >
              <h3 className="text-lg font-semibold mb-4">
                Báo mất/hỏng:{" "}
                <span className="text-blue-600">
                  {selectedBook.book?.title}
                </span>
              </h3>

              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => setReportType("lost")}
                  className={`flex-1 px-3 py-2 rounded-lg border ${
                    reportType === "lost"
                      ? "bg-red-100 border-red-400 text-red-600"
                      : "hover:bg-gray-100 border-gray-200"
                  } flex items-center justify-center gap-2`}
                >
                  <AlertCircle size={16} /> Báo mất
                </button>
                <button
                  onClick={() => setReportType("damaged")}
                  className={`flex-1 px-3 py-2 rounded-lg border ${
                    reportType === "damaged"
                      ? "bg-yellow-100 border-yellow-400 text-yellow-600"
                      : "hover:bg-gray-100 border-gray-200"
                  } flex items-center justify-center gap-2`}
                >
                  <CheckCircle size={16} /> Báo hỏng
                </button>
              </div>

              <textarea
                placeholder="Nhập lý do..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm mb-4 resize-none h-24"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedBook(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Hủy
                </button>
                <button
                  onClick={handleReport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Gửi báo cáo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
