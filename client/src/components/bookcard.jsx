import React from "react";
import { Link } from "react-router-dom";
import { Eye, Star, User } from "lucide-react";

function BookCard({ book, btnColor = "bg-yellow-400 hover:bg-yellow-500" }) {
  const avgRating =book.reviews && book.reviews.length > 0 ? (
          book.reviews.reduce((acc, r) => acc + r.rating, 0) /
          book.reviews.length
        ).toFixed(1)
      : 0;
  return (
    <div
      className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col 
                 h-[440px] transform hover:-translate-y-1 hover:scale-[1.02]"
    >
      <div className="relative w-full h-60 bg-gray-50 flex items-center justify-center overflow-hidden">
        <img
          src={
            book.images?.[0] ||
            "https://cdn-icons-png.flaticon.com/512/2232/2232688.png"
          }
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            e.target.src =
              "https://cdn-icons-png.flaticon.com/512/2232/2232688.png";
          }}
        />
      </div>

      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <h3
            className="text-lg font-semibold text-gray-900 mb-2 leading-snug line-clamp-2 
                       hover:text-yellow-500 transition-colors duration-200 text-center"
          >
            {book.title}
          </h3>

          <p className="text-gray-600 text-sm mb-3 flex items-center justify-center gap-2 italic">
            <User size={15} className="text-gray-500" />
            <span className="text-gray-700 font-medium">{book.author?.name || "Không rõ"}</span>
          </p>
        </div>

        <div className="flex justify-center items-center text-sm text-gray-700 mb-3 gap-4 flex-wrap">
          <span className="flex items-center gap-1 text-blue-600 font-medium">
            <Eye size={15} />
            <span>{book.views || 0} lượt xem</span>
          </span>
          <span className="flex items-center gap-1 text-yellow-500 font-semibold">
            <Star size={15} /> {avgRating} / 5
          </span>
        </div>

        <div className="mb-4 flex items-center justify-between gap-2 px-1">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
            (book.available ?? 0) > 0
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-red-100 text-red-700 border border-red-200"
          }`}>
            <span>📚</span>
            <span>
              {(book.available ?? 0) > 0 
                ? `Còn ${book.available} quyển` 
                : "Hết sách"}
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
            <span>📖</span>
            <span>{book.borrowCount || 0} lượt mượn</span>
          </div>
        </div>

        <Link
          to={`/book/${book._id}`}
          className={`${btnColor} text-white font-semibold py-2.5 rounded-lg w-full 
            text-center block transition-all duration-300 shadow-md hover:shadow-lg tracking-wide`}
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}

export default BookCard;
