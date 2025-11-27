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
        size={12}
        className={index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
      />
    ));
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl ring-1 ring-slate-200 p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
            💬
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Bình luận
          </h2>
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl p-3 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-slate-200"></div>
                <div className="flex-1">
                  <div className="h-3 w-24 bg-slate-200 rounded mb-1"></div>
                  <div className="h-2 w-16 bg-slate-200 rounded"></div>
                </div>
              </div>
              <div className="h-12 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl ring-1 ring-slate-200 p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
            💬
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Bình luận
          </h2>
        </div>
        <div className="text-center py-8 bg-white rounded-xl border border-slate-200">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-slate-600 font-medium text-sm">
            Chưa có đánh giá
          </p>
          <p className="text-slate-500 text-xs mt-1">
            Hãy là người đầu tiên!
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
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl ring-1 ring-slate-200 p-5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
            💬
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Bình luận
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg px-2.5 py-1.5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-0.5">
            <Star size={16} className="fill-yellow-400 text-yellow-400" />
            <span className="font-bold text-sm text-slate-900">{avgRating}</span>
          </div>
          <div className="h-4 w-px bg-slate-300"></div>
          <span className="text-slate-600 text-xs font-medium">
            {reviews.length}
          </span>
        </div>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {reviews
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((review) => (
            <div
              key={review._id}
              className="bg-white border border-slate-200 rounded-xl p-3.5 hover:shadow-md hover:border-blue-300 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                    {review.userId?.fullName
                      ? review.userId.fullName.charAt(0).toUpperCase()
                      : "A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">
                      {review.userId?.fullName || "Người dùng ẩn danh"}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <span>🕒</span>
                      <span>{formatTime(review.createdAt)}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200 flex-shrink-0 ml-2">
                  {renderStars(review.rating)}
                </div>
              </div>

              {review.comment && (
                <div className="mt-3 pl-2 border-l-4 border-blue-200 bg-slate-50 rounded-r-lg p-3">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-xs">
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

