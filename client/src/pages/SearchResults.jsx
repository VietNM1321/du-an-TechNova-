import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import BookCard from "../components/bookcard";

const SearchResults = () => {
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const query = new URLSearchParams(location.search).get("q") || "";

  useEffect(() => {
    const fetchSearch = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/books/search?q=${encodeURIComponent(
            query
          )}`
        );
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

  return (
    <div className="container mx-auto py-6 px-4">
      <main className="bg-gray-50 p-5 rounded-xl shadow-inner min-h-[500px]">
        <h3 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
          <span role="img" aria-label="search">
            🔎
          </span>
          Kết quả tìm kiếm {query ? `: "${query}"` : ""}
        </h3>

        {message ? (
          <p className="text-gray-500 text-center mt-20 text-lg">{message}</p>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map((book) => (
              <BookCard key={book._id} book={book} btnColor="bg-blue-600 hover:bg-blue-700" />
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
