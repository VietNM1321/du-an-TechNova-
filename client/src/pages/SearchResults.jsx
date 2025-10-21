import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const query = new URLSearchParams(location.search).get("q") || "";

  useEffect(() => {
    const fetchSearch = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/books/search?q=${encodeURIComponent(query)}`);
        setResults(res.data);
        setMessage("");
      } catch (error) {
        if (error.response?.status === 404) {
          setMessage("Không tìm thấy sản phẩm phù hợp.");
          setResults([]);
        } else {
          console.error("Lỗi khi tìm kiếm:", error);
          setMessage("Có lỗi xảy ra khi tìm kiếm.");
        }
      }
    };
    if (query.trim()) {
      fetchSearch();
    } else {
      setResults([]);
      setMessage("Nhập từ khóa để tìm kiếm.");
    }
  }, [location.search, query]);

  const handleViewDetail = (bookId) => {
    navigate(`/books/${bookId}`);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <main className="bg-gray-50 p-5 rounded-xl shadow-inner min-h-[500px]">
        <h3 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
          <span role="img" aria-label="search">🔎</span>
          Kết quả tìm kiếm {query ? `: "${query}"` : ""}
        </h3>

        {message ? (
          <p className="text-gray-500 text-center mt-20 text-lg">{message}</p>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map((book) => (
              <div
                key={book._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg overflow-hidden transition-transform transform hover:-translate-y-1"
              >
                <div className="aspect-[3/4] w-full overflow-hidden">
                  <img
                    src={book.image || "/default-book.jpg"}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4 flex flex-col justify-between h-[150px]">
                  <div>
                    <h4 className="text-base font-semibold text-gray-800 line-clamp-2">
                      {book.title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {book.author?.name || "Không rõ"}
                    </p>
                  </div>
                  <div className="mt-3">
                    <button
                        onClick={() => handleViewDetail(book._id)}
                        className="w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        Xem chi tiết
                      </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-20 text-lg">
            Chọn hoặc nhập từ khóa để tìm kiếm sách 📚
          </p>
        )}
      </main>
    </div>
  );
};

export default SearchResults;
