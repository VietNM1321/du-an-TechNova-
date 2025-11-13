import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import axios from "axios";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("clientToken");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        alert("Vui lòng đăng nhập trước!");
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data.user);
        setBorrowedBooks(res.data.borrowings || []);
      } catch (err) {
        console.error("❌ Lỗi khi tải hồ sơ:", err);
        alert("Không thể tải thông tin hồ sơ. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={36} />
      </div>
    );

  if (!user)
    return (
      <div className="text-center text-gray-500 mt-10">
        Không tìm thấy thông tin người dùng.
      </div>
    );

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Hồ sơ người dùng</h1>

      <div className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-100">
        <p className="text-gray-700 text-lg">
          <strong>Mã sinh viên:</strong> {user.studentCode || "Không có"}
        </p>
        <p className="text-gray-700 text-lg mt-2">
          <strong>Họ tên:</strong> {user.fullName || "Không có"}
        </p>
        <p className="text-gray-700 text-lg mt-2">
          <strong>Email:</strong> {user.email || "Không có"}
        </p>
        <p className="text-gray-700 text-lg mt-2">
          <strong>Khóa học:</strong> {user.course || "Chưa có"}
        </p>

        <div className="mt-5 flex gap-4">
          <button
            onClick={() => navigate("/changepassword")}
            className="bg-yellow-500 text-white px-5 py-2 rounded-lg hover:bg-yellow-600 transition"
          >
            Đổi mật khẩu
          </button>

          <button
            onClick={() => navigate("/history")}
            className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Xem lịch sử mượn
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Danh sách sách đã mượn
        </h2>

        {borrowedBooks.length === 0 ? (
          <p className="text-gray-500 text-center">
            Bạn chưa mượn quyển sách nào.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3 text-left">Tên sách</th>
                  <th className="p-3 text-left">Ngày mượn</th>
                  <th className="p-3 text-left">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {borrowedBooks.map((b) => (
                  <tr key={b._id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{b.book?.title || "Không xác định"}</td>
                    <td className="p-3">
                      {new Date(b.borrowDate).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-3">
                      {b.status === "borrowed"
                        ? "Đang mượn"
                        : b.status === "overdue"
                        ? "Trễ hạn"
                        : "Đã trả"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
