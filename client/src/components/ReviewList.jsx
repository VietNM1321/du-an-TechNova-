import React from "react";
import { Star } from "lucide-react";

function ReviewList({ reviews, loading }) {
  // Format thời gian
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Render sao
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
      />
    ));
  };

  if (loading) {
    return (
      <div className="mt-8 bg-white/80 backdrop-blur rounded-2xl shadow-xl ring-1 ring-slate-100 p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          💬 Đánh giá và bình luận
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 w-24 bg-slate-200 rounded mb-3"></div>
              <div className="h-16 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="mt-8 bg-white/80 backdrop-blur rounded-2xl shadow-xl ring-1 ring-slate-100 p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          💬 Đánh giá và bình luận
        </h2>
        <div className="text-center py-8">
          <p className="text-slate-500 text-sm">
            Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá cuốn sách này!
          </p>
        </div>
      </div>
    );
  }

  // Tính rating trung bình
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="mt-8 bg-white/80 backdrop-blur rounded-2xl shadow-xl ring-1 ring-slate-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          💬 Đánh giá và bình luận
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star size={20} className="fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-slate-900">{avgRating}</span>
          </div>
          <span className="text-slate-500 text-sm">({reviews.length} đánh giá)</span>
        </div>
      </div>

      <div className="space-y-4">
        {reviews
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((review) => (
            <div
              key={review._id}
              className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                    {review.userId?.fullName
                      ? review.userId.fullName.charAt(0).toUpperCase()
                      : "A"}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {review.userId?.fullName || "Người dùng ẩn danh"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatTime(review.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {renderStars(review.rating)}
                </div>
              </div>

              {review.comment && (
                <div className="mt-3">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {review.comment}
                  </p>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default ReviewList;

