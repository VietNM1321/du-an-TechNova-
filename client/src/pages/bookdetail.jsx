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
        const res = await axios.get(`http://localhost:5000/api/books?category=${book.category._id}`);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/80 hover:text-slate-900 transition-all font-medium">
              <span>←</span>
              <span>Quay lại</span>
            </button>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">{book.category?.name || "Thể loại"}</span>
          </div>
          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl ring-1 ring-white/50 p-6 md:p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="flex justify-center items-start">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                      <img
                        src={book.images?.[0] || defaultImage}
                        alt={book.title}
                        className="relative rounded-2xl shadow-2xl w-full max-w-sm object-cover aspect-[3/4] ring-4 ring-white"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-5 text-slate-800">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-4 leading-tight">
                        {book.title}
                      </h1>
                      <div className="flex flex-wrap items-center gap-2.5 mb-4">
                        <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-xs font-semibold ring-1 ring-blue-200 shadow-sm">
                          <span className="mr-1.5">✍️</span>
                          {book.author?.name || "Không rõ"}
                        </span>
                        <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 text-xs font-semibold ring-1 ring-emerald-200 shadow-sm">
                          <span className="mr-1.5">📁</span>
                          {book.category?.name || "Chưa rõ"}
                        </span>
                        <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold ring-1 shadow-sm ${
                          (book.available ?? 0) > 0
                            ? "bg-gradient-to-r from-green-50 to-green-100 text-green-700 ring-green-200"
                            : "bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 ring-rose-200"
                        }`}>
                          {(book.available ?? 0) > 0 
                            ? `✅ Còn ${book.available} quyển` 
                            : "❌ Hết sách"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="bg-slate-50 border border-blue-100 rounded-xl px-4 py-3 flex flex-col gap-1 shadow-inner flex-1">
                          <span className="text-sm uppercase tracking-wide text-slate-500">Số lượng</span>
                          <span className="text-xl font-bold text-blue-600">
                            {book.available ?? 0} / {book.quantity ?? 0} quyển
                          </span>
                        </div>
                        <div className="bg-slate-50 border border-purple-100 rounded-xl px-4 py-3 flex flex-col gap-1 shadow-inner flex-1">
                          <span className="text-sm uppercase tracking-wide text-slate-500">Lượt mượn</span>
                          <span className="text-xl font-bold text-purple-600">
                            {book.borrowCount || 0} lượt
                          </span>
                        </div>
                      </div>
                      <div className="mb-2">
                        <div className="bg-slate-50 border border-rose-100 rounded-xl px-4 py-3 flex flex-col gap-1 shadow-inner">
                          <span className="text-sm uppercase tracking-wide text-slate-500">Giá đền bù</span>
                          <span className="text-xl font-bold text-rose-600">
                            {(book.Pricebook ?? 0).toLocaleString("vi-VN")} VNĐ
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-xl p-5 border border-slate-200 shadow-inner">
                      <h3 className="font-bold text-slate-900 mb-2.5 flex items-center gap-2">
                        <span>📖</span>
                        <span>Mô tả</span>
                      </h3>
                      <p className="text-slate-700 leading-relaxed text-sm">
                        {book.description || "Chưa có mô tả cho cuốn sách này."}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => navigate(-1)}
                        className="inline-flex justify-center items-center gap-2 border-2 border-slate-300 px-5 py-3 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all font-semibold shadow-sm hover:shadow-md">
                        <span>←</span>
                        <span>Quay lại</span>
                      </button>
                      <button
                        onClick={handleBorrowClick}
                        className="inline-flex justify-center items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-5 py-3 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                        <span>✅</span>
                        <span>Mượn sách</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
                <ReviewForm bookId={id} onReviewAdded={fetchReviews} />
                <ReviewList reviews={reviews} loading={loadingReviews} />
              </div>
            </div>
          </div>
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
              <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                <span>📚</span>
                <span>Sách cùng thể loại</span>
              </h2>
              <div className="flex-1 h-1 bg-gradient-to-r from-purple-600 to-transparent rounded-full"></div>
            </div>
            {relatedBooks.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl ring-1 ring-white/50 p-12 text-center">
                <div className="text-5xl mb-4">📖</div>
                <p className="text-slate-600 font-medium">
                  Không có sách liên quan
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Hãy quay lại sau để xem thêm sách mới
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {relatedBooks.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleViewRelated(item._id)}
                    className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden group cursor-pointer ring-1 ring-white/50"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={item.images?.[0] || defaultImage}
                        alt={item.title}
                        className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                          <span className="text-lg">🔍</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-bold text-slate-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors min-h-[3rem]">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-500 mb-4 flex items-center gap-1.5">
                        <span>✍️</span>
                        <span>{item.author?.name || "Không rõ"}</span>
                      </p>
                      <button className="w-full bg-gradient-to-r from-blue-600 via-blue-600 to-purple-600 text-white text-sm font-semibold py-3 rounded-xl hover:from-blue-700 hover:via-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]">
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {showBorrowForm && (
            <BorrowForm book={book} onClose={() => setShowBorrowForm(false)} />
          )}
        </div>
      </div>
    </div>
  );
}

export default BookDetail;
