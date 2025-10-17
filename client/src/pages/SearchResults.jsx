import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const SearchResults = () => {
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchSearch = async () => {
      const query = new URLSearchParams(location.search).get("q");
      try {
        const res = await axios.get(`http://localhost:5000/api/books/search?q=${query}`);
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
    fetchSearch();
  }, [location.search]);

  return (
    <div className="search-results">
      <h2>Kết quả tìm kiếm</h2>
      {message && <p>{message}</p>}
      <div className="grid grid-cols-4 gap-4">
        {results.map((book) => (
          <div key={book._id} className="p-4 border rounded">
            <h3>{book.title}</h3>
            <p>{book.author?.name}</p>
            <p>{book.category?.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
