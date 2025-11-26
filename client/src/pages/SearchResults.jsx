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
  const [categories, setCategories] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const query = new URLSearchParams(location.search).get("q") || "";

  // 🟢 Lấy danh sách tác giả và danh mục
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [authorRes, categoryRes] = await Promise.all([
          axios.get("http://localhost:5001/api/authors"),
          axios.get("http://localhost:5001/api/category?sort=createdAt&order=asc"),
        ]);

        const authorData = Array.isArray(authorRes.data)
          ? authorRes.data
          : authorRes.data.authors || [];
        const categoryData = Array.isArray(categoryRes.data)
          ? categoryRes.data
          : categoryRes.data.categories || [];

        setAuthors(authorData);
        setCategories(categoryData);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu filter:", err);
      }
    };
    fetchFilters();
  }, []);

  // 🟢 Gọi API tìm kiếm
  const fetchSearch = async () => {
    try {
      let url = `http://localhost:5001/api/books/search?q=${encodeURIComponent(query)}`;
      if (selectedAuthor) url += `&author=${selectedAuthor}`;
      if (selectedCategory) url += `&category=${selectedCategory}`;

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

  // 🟢 Tự động tìm kiếm khi query hoặc filter thay đổi
  useEffect(() => {
    if (query.trim()) {
      fetchSearch();
    } else {
      setResults([]);
      setMessage("Nhập từ khóa để tìm kiếm.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selectedAuthor, selectedCategory, location.search]);

  // 🟢 Xử lý thay đổi bộ lọc
  const handleFilterChange = (type, value) => {
    if (type === "author") setSelectedAuthor(value);
    if (type === "category") setSelectedCategory(value);

    const params = new URLSearchParams(location.search);
    if (value) params.set(type, value);
    else params.delete(type);
    navigate({ search: params.toString() });
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <main className="bg-gray-50 p-5 rounded-xl shadow-inner min-h-[500px]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <span role="img" aria-label="search">
              🔎
            </span>
            Kết quả tìm kiếm {query ? `: "${query}"` : ""}
          </h3>

          <div className="flex flex-wrap gap-3">
            {/* 🧑‍💼 Filter tác giả */}
            <select
              value={selectedAuthor}
              onChange={(e) => handleFilterChange("author", e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-gray-700"
            >
              <option value="">-- Lọc theo tác giả --</option>
              {Array.isArray(authors) &&
                authors.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
            </select>

            {/* 📚 Filter danh mục */}
            <select
              value={selectedCategory}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-gray-700"
            >
              <option value="">-- Lọc theo danh mục --</option>
              {Array.isArray(categories) &&
                categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
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
