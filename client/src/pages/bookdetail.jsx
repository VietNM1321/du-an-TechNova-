import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/books/${id}`);
        setBook(res.data);
      } catch (err) {
        console.error("Lỗi khi tải chi tiết sách:", err);
      }
    };
    fetchBook();
  }, [id]);

  useEffect(() => {
    if (book?.category?.id) {
      const fetchRelated = async () => {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/books?category=${book.category.id}`
          );
          const filtered = res.data.filter((b) => b.id !== id);
          setRelatedBooks(filtered);
        } catch (err) {
          console.error("Lỗi khi tải sách liên quan:", err);
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

  const defaultImage =
    "https://cdn-icons-png.flaticon.com/512/2232/2232688.png";

  return (
    <div className="max-w-6xl mx-auto p-6 pt-24 grid md:grid-cols-2 gap-8 bg-white rounded-xl shadow-lg">
      {/* Cột trái: Ảnh */}
      <div className="flex justify-center items-start">
        <img
          src={book.image || defaultImage}
          alt={book.title}
          className="rounded-lg shadow-md w-full max-w-sm object-cover"
        />
      </div>

      {/* Cột phải: Thông tin chi tiết */}
      <div className="flex flex-col gap-2 text-gray-800">
        <h1 className="text-2xl font-bold text-blue-700 uppercase">
          {book.title}
        </h1>
        <p>
          <strong>Tác giả:</strong>{" "}
          <span className="text-blue-600">{book.author?.name || "Không rõ"}</span>
        </p>
        <p>
          <strong>Số trang:</strong> {book.pages || "Không rõ"}
        </p>
        <p>
          <strong>Định dạng:</strong> {book.format || "Hình ảnh"}
        </p>
        <p>
          <strong>Phân loại:</strong> {book.category?.name || "Truyện tranh"}
        </p>
        <p>
          <strong>Tình trạng:</strong> {book.status || "Đang cập nhật..."}
        </p>
        <p>
          <strong>Lượt xem/nghe:</strong> {book.views || 0}
        </p>
        <p>
          <strong>Truyện CBZ:</strong> {book.downloads || 0} lượt tải
        </p>
        <p>
          <strong>Tạo lúc:</strong>{" "}
          {new Date(book.createdAt).toLocaleString("vi-VN")}
        </p>
        <p>
          <strong>Cập nhật lúc:</strong>{" "}
          {new Date(book.updatedAt).toLocaleString("vi-VN")}
        </p>

        <div className="mt-4 flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="border border-gray-400 px-4 py-2 rounded-md hover:bg-gray-100"
          >
            ⬅ Quay lại
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            ✅ Mượn sách
          </button>
        </div>
      </div>
      <div className="mt-6 border-t pt-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">
            📚 Sản phẩm liên quan
          </h2>
          {relatedBooks.length === 0 ? (
            <p className="text-gray-500 text-sm">Không có sách liên quan.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {relatedBooks.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 p-2 rounded-lg cursor-pointer hover:shadow-md transition"
                  onClick={() => navigate(`/books/${item.id}`)}
                >
                  <img
                    src={item.image || defaultImage}
                    alt={item.title}
                    className="w-full h-32 object-cover rounded-md"
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
