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

  if (!book) {
    return (
      <div className="text-center p-10 text-gray-600">
        Đang tải chi tiết sách...
      </div>
    );
  }

  const defaultImage = "https://cdn-icons-png.flaticon.com/512/2232/2232688.png";

  const handleBorrow = async () => {
    try {
      await addToCart({ bookId: book._id, quantity: 1 });
      alert("✅ Đã thêm sách vào giỏ!");
    } catch (err) {
      console.error("Lỗi khi thêm sách vào giỏ:", err);
      alert("❌ Thêm sách vào giỏ thất bại.");
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-2 gap-8 bg-white rounded-xl shadow-lg">
        <div className="flex justify-center items-start">
          <img
            src={book.images?.[0] || defaultImage}
            alt={book.title}
            className="rounded-lg shadow-md w-full max-w-sm object-cover"
          />
        </div>

        <div className="flex flex-col gap-3 text-gray-800">
          <h1 className="text-2xl font-bold text-blue-700 uppercase">
            {book.title}
          </h1>
          <p>
            <strong>Tác giả:</strong>{" "}
            <span className="text-blue-600">
              {book.author?.name || "Không rõ"}
            </span>
          </p>
          <p>
            <strong>Thể loại:</strong> {book.category?.name || "—"}
          </p>
          <p>
            <strong>Số lượng còn:</strong> {book.available ?? "—"}
          </p>
          <p>
            <strong>Mô tả:</strong> {book.description || "Chưa có mô tả"}
          </p>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="border border-gray-400 px-4 py-2 rounded-md hover:bg-gray-100"
            >
              ⬅ Quay lại
            </button>
            <button
              onClick={handleBorrow}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              ✅ Mượn sách
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-10 border-t pt-5">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          📚 Sách cùng thể loại
        </h2>
        {relatedBooks.length === 0 ? (
          <p className="text-gray-500 text-sm">Không có sách liên quan.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedBooks.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/book/${item._id}`)}
                className="bg-gray-50 p-3 rounded-lg cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <img
                  src={item.images?.[0] || defaultImage}
                  alt={item.title}
                  className="w-full h-40 object-cover rounded-md"
                />
                <h3 className="text-sm font-medium mt-2 text-gray-800">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500">
                  {item.author?.name || "Không rõ"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookDetail;
