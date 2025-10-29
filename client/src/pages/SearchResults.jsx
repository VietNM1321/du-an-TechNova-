import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import BookCard from "../components/bookcard";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [authors, setAuthors] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const query = new URLSearchParams(location.search).get("q") || "";

  // 🟢 Lấy danh sách tác giả
  useEffect(() => {
  axios
    .get("http://localhost:5000/api/authors")
    .then((res) => {
      // ✅ Nếu API trả về object có trường authors thì lấy đúng mảng
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.authors || [];
      setAuthors(data);
    })
    .catch((err) => console.error("Lỗi khi tải danh sách tác giả:", err));
}, []);


  // 🟢 Hàm fetch kết quả tìm kiếm (có filter tác giả)
  const fetchSearch = async () => {
    try {
      let url = `http://localhost:5000/api/books/search?q=${encodeURIComponent(query)}`;
      if (selectedAuthor) url += `&author=${selectedAuthor}`;

      const res = await axios.get(url);
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

  // 🟢 Gọi tìm kiếm khi query hoặc author thay đổi
  useEffect(() => {
    if (query.trim()) {
      fetchSearch();
    } else {
      setResults([]);
      setMessage("Nhập từ khóa để tìm kiếm.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, query, selectedAuthor]);

  // 🟢 Xử lý chọn tác giả
  const handleAuthorChange = (e) => {
    const authorId = e.target.value;
    setSelectedAuthor(authorId);

    // Giữ nguyên từ khóa trong URL, chỉ thay đổi filter
    const params = new URLSearchParams(location.search);
    if (authorId) params.set("author", authorId);
    else params.delete("author");
    navigate({ search: params.toString() });
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <main className="bg-gray-50 p-5 rounded-xl shadow-inner min-h-[500px]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <span role="img" aria-label="search">
              🔎
            </span>
            Kết quả tìm kiếm {query ? `: "${query}"` : ""}
          </h3>

          {/* 🧩 Bộ lọc tác giả */}
          <select
            value={selectedAuthor}
            onChange={handleAuthorChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-gray-700 mt-3 sm:mt-0"
          >
            <option value="">-- Lọc theo tác giả --</option>
            {authors.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {message ? (
          <p className="text-gray-500 text-center mt-20 text-lg">{message}</p>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                btnColor="bg-blue-600 hover:bg-blue-700"
              />
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
