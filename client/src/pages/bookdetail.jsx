import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../components/cart";

function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const { addToCart } = useCart();

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
    window.scrollTo({ top: 0, behavior: "smooth" }); // cái này để cuận trang
  }, [id]);
  useEffect(() => {
    if (book?.category?._id) {
      const fetchRelated = async () => {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/books?category=${book.category._id}`
          );
          const filtered = res.data.filter((b) => b._id !== id);
          setRelatedBooks(filtered);
        } catch (err) {
          console.error("❌ Lỗi khi tải sách liên quan:", err);
        }
      };
      fetchRelated();
    }
  }, [book, id]);

  const handleBorrow = async () => {
    try {
      await addToCart({ bookId: book._id, quantity: 1 });
      alert("✅ Đã thêm sách vào giỏ!");
    } catch (err) {
      console.error("Lỗi khi thêm sách vào giỏ:", err);
      alert("❌ Thêm sách vào giỏ thất bại.");
    }
  };
  const handleViewRelated = (relatedId) => {
    navigate(`/book/${relatedId}`);
  };

  if (!book) {
    return (
      <div className="text-center p-10 text-gray-600">
        Đang tải chi tiết sách...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-center items-start">
          <img
            src={book.images?.[0] || defaultImage}
            alt={book.title}
            className="rounded-lg shadow-md w-full max-w-sm object-cover"
          />
        </div>
        <div className="flex flex-col gap-3 text-gray-800">
          <h1 className="text-3xl font-bold text-blue-700">{book.title}</h1>
          <p>
            <strong>Tác giả:</strong>{" "}
            <span className="text-blue-600">{book.author?.name || "Không rõ"}</span>
          </p>
          <p>
            <strong>Thể loại:</strong> {book.category?.name || "—"}
          </p>
          <p>
            <strong>Số lượng còn:</strong>{" "}
            <span className="text-green-700 font-semibold">
              {book.available ?? "—"}
            </span>
          </p>
          <p>
            <strong>Mô tả:</strong>{" "}
            <span className="text-gray-700">{book.description || "Chưa có mô tả"}</span>
          </p>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="border border-gray-400 px-5 py-2 rounded-md hover:bg-gray-100 transition"
            >
              ⬅ Quay lại
            </button>
            <button
              onClick={handleBorrow}
              className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition"
            >
              ✅ Mượn sách
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-12 border-t pt-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          📚 Sách cùng thể loại
        </h2>

        {relatedBooks.length === 0 ? (
          <p className="text-gray-500 text-center text-sm">
            Không có sách liên quan.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedBooks.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group"
              >
                <div
                  onClick={() => handleViewRelated(item._id)}
                  className="cursor-pointer"
                >
                  <img
                    src={item.images?.[0] || defaultImage}
                    alt={item.title}
                    className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-4">
                    <h3 className="text-base font-semibold text-gray-800 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.author?.name || "Không rõ"}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewRelated(item._id);
                      }}
                      className="mt-3 w-full bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700 transition"
                    >
                      🔍 Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookDetail;
