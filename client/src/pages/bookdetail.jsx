import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import BorrowForm from "../components/BorrowForm";
import ReviewList from "../components/ReviewList";
import ReviewForm from "../components/ReviewForm";

function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const defaultImage = "https://cdn-icons-png.flaticon.com/512/2232/2232688.png";
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/books/${id}`);
        setBook(res.data);
      } catch (err) {
        console.error("❌ Lỗi khi tải chi tiết sách:", err);
      }
    };
    fetchBook();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);
  useEffect(() => {
  if (book?.category?._id) {
    const fetchRelated = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/books?category=${book.category._id}`
        );
        let booksArray = [];
        if (Array.isArray(res.data)) {
          booksArray = res.data;
        } else if (Array.isArray(res.data.books)) {
          booksArray = res.data.books;
        } else {
          console.warn("API trả về dữ liệu không phải mảng:", res.data);
        }
        const filtered = booksArray.filter((b) => b._id !== id);
        setRelatedBooks(filtered);
      } catch (err) {
        console.error("❌ Lỗi khi tải sách liên quan:", err.response?.data || err);
      }
    };
    fetchRelated();
  }
}, [book, id]);

  const handleViewRelated = (relatedId) => {
    navigate(`/book/${relatedId}`);
  };

  const handleBorrowClick = () => {
    const token = localStorage.getItem("clientToken");
    const user = localStorage.getItem("clientUser");
    if (!token || !user) {
      alert("Vui lòng đăng nhập để mượn sách.");
      return;
    }
    setShowBorrowForm(true);
  };

  // Fetch reviews
  const fetchReviews = async () => {
    if (!id) return;
    try {
      setLoadingReviews(true);
      const res = await axios.get(`http://localhost:5000/api/reviews?bookId=${id}`);
      setReviews(res.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải đánh giá:", err);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Load reviews khi component mount hoặc bookId thay đổi
  useEffect(() => {
    if (id) {
      fetchReviews();
    }
  }, [id]);

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-6xl mx-auto">
            <div className="h-6 w-40 rounded-full bg-slate-200 animate-pulse mb-6"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-[3/4] w-full max-w-sm mx-auto rounded-xl bg-slate-200 animate-pulse" />
              <div className="space-y-4">
                <div className="h-8 w-3/4 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-1/3 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                <div className="h-24 w-full bg-slate-200 rounded animate-pulse" />
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse" />
                  <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1 hover:text-slate-700 transition"
            >
              ⬅ Quay lại
            </button>
            <span>•</span>
            <span>{book.category?.name || "Thể loại"}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-8 bg-white/80 backdrop-blur rounded-2xl shadow-xl ring-1 ring-slate-100 p-6">
            <div className="flex justify-center items-start md:sticky md:top-6">
              <img
                src={book.images?.[0] || defaultImage}
                alt={book.title}
                className="rounded-xl shadow-md w-full max-w-sm object-cover aspect-[3/4]"
              />
            </div>

            <div className="flex flex-col gap-4 text-slate-800">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                {book.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium ring-1 ring-blue-100">
                  ✍️ Tác giả: {book.author?.name || "Không rõ"}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium ring-1 ring-emerald-100">
                  📁 {book.category?.name || "Chưa rõ"}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ring-1 ${
                  (book.available ?? 0) > 0
                    ? "bg-green-50 text-green-700 ring-green-100"
                    : "bg-rose-50 text-rose-700 ring-rose-100"
                }`}>
                  {(book.available ?? 0) > 0 ? "✅ Còn sách" : "❌ Hết sách"}
                </span>
              </div>

              <div className="space-y-2 text-slate-700">
                <p className="leading-relaxed">
                  <span className="font-semibold text-slate-900">Mô tả:</span>{" "}
                  {book.description || "Chưa có mô tả"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex justify-center items-center gap-2 border border-slate-300 px-5 py-3 rounded-xl hover:bg-slate-50 transition font-medium"
                >
                  ← Quay lại
                </button>
                <button
                  onClick={handleBorrowClick}
                  className="inline-flex justify-center items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl hover:bg-emerald-700 transition font-semibold shadow-sm"
                >
                  ✅ Mượn sách
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              📚 Sách cùng thể loại
            </h2>

            {relatedBooks.length === 0 ? (
              <p className="text-slate-500 text-center text-sm">
                Không có sách liên quan.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {relatedBooks.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleViewRelated(item._id)}
                    className="bg-white/90 backdrop-blur rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group cursor-pointer ring-1 ring-slate-100"
                  >
                    <img
                      src={item.images?.[0] || defaultImage}
                      alt={item.title}
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="p-4">
                      <h3 className="text-base font-semibold text-slate-900 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {item.author?.name || "Không rõ"}
                      </p>
                      <button className="mt-3 w-full bg-blue-600 text-white text-sm py-2.5 rounded-lg hover:bg-blue-700 transition">
                        🔍 Xem chi tiết
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review Form - Form để thêm đánh giá */}
          <ReviewForm bookId={id} onReviewAdded={fetchReviews} />

          {/* Review List - Danh sách đánh giá */}
          <ReviewList reviews={reviews} loading={loadingReviews} />

          {showBorrowForm && (
            <BorrowForm book={book} onClose={() => setShowBorrowForm(false)} />
          )}
        </div>
      </div>
    </div>
  );
}

export default BookDetail;
