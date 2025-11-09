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
      <div className="mt-8 bg-white/80 backdrop-blur rounded-2xl shadow-xl ring-1 ring-slate-100 p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          ✍️ Đánh giá sách này
        </h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            🔒 Vui lòng{" "}
            <a
              href="/login"
              className="font-semibold underline hover:text-blue-900"
            >
              đăng nhập
            </a>{" "}
            để đánh giá và bình luận về cuốn sách này.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white/80 backdrop-blur rounded-2xl shadow-xl ring-1 ring-slate-100 p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        ✍️ Đánh giá sách này
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Đánh giá của bạn <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            {renderStars()}
            {rating > 0 && (
              <span className="text-sm text-slate-600 ml-2">
                ({rating}/5 sao)
              </span>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Bình luận (tùy chọn)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ suy nghĩ của bạn về cuốn sách này..."
            rows={4}
            disabled={loading}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-slate-100 disabled:cursor-not-allowed resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!rating || loading}
          className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              Đang gửi...
            </>
          ) : (
            <>
              📤 Gửi đánh giá
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default ReviewForm;

