import React, { useEffect, useState } from "react";
import axios from "axios";
import { Star, Search, Trash2, Eye } from "lucide-react";
const ReviewManager = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);
  const fetchReviews = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/reviews?page=${pageNum}&limit=10`);
      // Backend có thể trả về với pagination hoặc mảng trực tiếp
      if (res.data.reviews) {
        setReviews(res.data.reviews || []);
        setTotalPages(res.data.totalPages || 1);
        setPage(res.data.currentPage || 1);
      } else if (Array.isArray(res.data)) {
        // Nếu backend trả về mảng trực tiếp (không có pagination)
        setReviews(res.data || []);
        setTotalPages(1);
        setPage(1);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error("❌ Lỗi tải danh sách đánh giá:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchReviews(page);
  }, [page]);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa đánh giá này?")) {
      try {
        await axios.delete(`http://localhost:5000/api/reviews/${id}`);
        alert("✅ Xóa đánh giá thành công!");
        fetchReviews(page);
      } catch (err) {
        alert(
          err.response?.data?.message || "❌ Không thể xóa đánh giá!"
        );
      }
    }
  };
  const handlePrev = () => { // phân trang
    if (page > 1) setPage(page - 1);
  };
  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };
  // Format thời gian
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  // lấy sao
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={14}
        className={
          index < rating
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }
      />
    ));
  };
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      !searchTerm ||
      review.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.bookId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating =
      filterRating === "all" || review.rating === parseInt(filterRating);

    return matchesSearch && matchesRating;
  });
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-blue-700">💬 Quản lý Đánh giá và Bình luận</h2>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, sách, nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Lọc theo sao:</label>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="all">Tất cả</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
        </div>
        <button
          onClick={() => fetchReviews(page)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          🔄 Làm mới
        </button>
      </div>
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin text-4xl">⏳</div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-blue-100 text-blue-800">
                <tr>
                  <th className="p-3 border text-left">Người đánh giá</th>
                  <th className="p-3 border text-left">Sách</th>
                  <th className="p-3 border text-center">Đánh giá</th>
                  <th className="p-3 border text-left">Bình luận</th>
                  <th className="p-3 border text-center">Thời gian</th>
                  <th className="p-3 border text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500 italic">
                      📭 {loading ? "Đang tải..." : "Chưa có đánh giá nào."}
                    </td>
                  </tr>
                ) : (
                  filteredReviews.map((review) => (
                    <tr
                      key={review._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3 border align-middle">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                            {review.userId?.fullName
                              ? review.userId.fullName.charAt(0).toUpperCase()
                              : "A"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {review.userId?.fullName || "Người dùng ẩn danh"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {review.userId?.email || ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 border align-middle">
                        <p className="font-medium text-gray-900">
                          {review.bookId?.title || "Không rõ"}
                        </p>
                      </td>
                      <td className="p-3 border text-center align-middle">
                        <div className="flex items-center justify-center gap-1">
                          {renderStars(review.rating)}
                          <span className="ml-2 text-sm font-semibold text-gray-700">
                            ({review.rating}/5)
                          </span>
                        </div>
                      </td>
                      <td className="p-3 border align-middle max-w-xs">
                        {review.comment ? (
                          <p className="text-gray-700 line-clamp-2">
                            {review.comment}
                          </p>
                        ) : (
                          <span className="text-gray-400 italic">Không có bình luận</span>
                        )}
                      </td>
                      <td className="p-3 border text-center align-middle text-sm text-gray-600">
                        {formatTime(review.createdAt)}
                      </td>
                      <td className="p-3 border text-center align-middle">
                        <div className="flex items-center justify-center gap-2">
                          {review.comment && (
                            <button
                              onClick={() => setSelectedReview(review)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1 text-sm transition"
                              title="Xem chi tiết"
                            >
                              <Eye size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(review._id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1 text-sm transition"
                            title="Xóa đánh giá"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Phân trang */}
      {!loading && filteredReviews.length > 0 && totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-4">
          <button
            onClick={handlePrev}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg border ${
              page === 1
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-blue-600 border-blue-400 hover:bg-blue-100"
            }`}
          >
            ◀ Trước
          </button>

          <span className="px-4 py-2 text-gray-700 font-semibold">
            Trang {page}/{totalPages}
          </span>

          <button
            onClick={handleNext}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-lg border ${
              page === totalPages
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-blue-600 border-blue-400 hover:bg-blue-100"
            }`}
          >
            Sau ▶
          </button>
        </div>
      )}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Chi tiết đánh giá</h3>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {selectedReview.userId?.fullName
                    ? selectedReview.userId.fullName.charAt(0).toUpperCase()
                    : "A"}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedReview.userId?.fullName || "Người dùng ẩn danh"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedReview.userId?.email || ""}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Sách:</p>
                <p className="font-medium text-gray-900">
                  {selectedReview.bookId?.title || "Không rõ"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Đánh giá:</p>
                <div className="flex items-center gap-2">
                  {renderStars(selectedReview.rating)}
                  <span className="text-sm font-semibold text-gray-700">
                    {selectedReview.rating}/5 sao
                  </span>
                </div>
              </div>
              {selectedReview.comment && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Bình luận:</p>
                  <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                    {selectedReview.comment}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 mb-1">Thời gian:</p>
                <p className="text-gray-700">
                  {formatTime(selectedReview.createdAt)}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedReview(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewManager;

