import React, { useState } from "react";
import { Star } from "lucide-react";
import axios from "axios";

function ReviewForm({ bookId, onReviewAdded }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Kiểm tra đăng nhập
  const user = JSON.parse(localStorage.getItem("clientUser") || "null");
  const isLoggedIn = !!user;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      setError("Vui lòng đăng nhập để đánh giá sách.");
      return;
    }

    if (!rating) {
      setError("Vui lòng chọn số sao đánh giá.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(
        "http://localhost:5000/api/reviews",
        {
          bookId,
          rating,
          comment: comment.trim() || undefined,
          userId: user._id || user.id,
        }
      );

      // Reset form
      setRating(0);
      setComment("");
      setHoveredRating(0);

      // Gọi callback để refresh danh sách reviews
      if (onReviewAdded) {
        onReviewAdded();
      }

      alert("✅ Đánh giá của bạn đã được gửi thành công!");
    } catch (err) {
      console.error("❌ Lỗi khi gửi đánh giá:", err);
      setError(
        err.response?.data?.message || "Không thể gửi đánh giá. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= (hoveredRating || rating);

      return (
        <button
          key={index}
          type="button"
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          disabled={!isLoggedIn || loading}
          className={`transition-all duration-200 ${
            !isLoggedIn || loading
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:scale-110"
          }`}
        >
          <Star
            size={32}
            className={
              isFilled
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }
          />
        </button>
      );
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl ring-1 ring-slate-200 p-5">
        <div className="mb-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
              ✍️
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Đánh giá sách
            </h2>
          </div>
          <p className="text-xs text-slate-500 ml-12.5">
            Chia sẻ cảm nhận của bạn
          </p>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-xl p-4 shadow-sm">
          <p className="text-blue-800 text-xs font-medium flex items-start gap-2">
            <span>🔒</span>
            <span>
              Vui lòng{" "}
              <a
                href="/login"
                className="font-bold underline hover:text-blue-900 transition-colors"
              >
                đăng nhập
              </a>{" "}
              để đánh giá và bình luận.
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl ring-1 ring-slate-200 p-5">
      <div className="mb-5">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
            ✍️
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Đánh giá sách
          </h2>
        </div>
        <p className="text-xs text-slate-500 ml-12">
          Chia sẻ cảm nhận của bạn
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <label className="block text-xs font-semibold text-slate-700 mb-2.5">
            Đánh giá <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-1 bg-slate-50 rounded-lg p-2">
              {renderStars()}
            </div>
            {rating > 0 && (
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-base font-bold text-slate-900">
                  {rating}
                </span>
                <span className="text-xs text-slate-500">/ 5 sao</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <label
            htmlFor="comment"
            className="block text-xs font-semibold text-slate-700 mb-2.5"
          >
            Bình luận (tùy chọn)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ suy nghĩ của bạn..."
            rows={4}
            disabled={loading}
            className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-slate-50 disabled:cursor-not-allowed resize-none text-slate-700 placeholder-slate-400"
          />
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-3 shadow-sm">
            <p className="text-red-800 text-xs font-medium flex items-center gap-1.5">
              <span>⚠️</span>
              <span>{error}</span>
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={!rating || loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none text-sm"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              <span>Đang gửi...</span>
            </>
          ) : (
            <>
              <span>📤</span>
              <span>Gửi đánh giá</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default ReviewForm;

