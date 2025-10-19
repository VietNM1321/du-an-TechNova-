import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

const SearchResults = () => {
  const { search } = useLocation();
  const q = new URLSearchParams(search).get("q") || "";
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!q) {
      setBooks([]);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`http://localhost:5000/api/books?search=${encodeURIComponent(q)}`)
      .then(res => {
        if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu");
        return res.json();
      })
      .then(data => setBooks(data))
      .catch(err => setError(err.message || "Lỗi"))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold mb-4">Kết quả tìm kiếm: "{q}"</h1>

      {loading && <p>Đang tải...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && books.length === 0 && <p>Không tìm thấy kết quả.</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {books.map(book => (
          <Link to={`/books/${book._id}`} key={book._id} className="border rounded-lg p-3 hover:shadow">
            <img src={book.image || "/placeholder.png"} alt={book.title} className="h-40 w-full object-cover mb-2" />
            <h3 className="text-sm font-medium">{book.title}</h3>
            <p className="text-xs text-gray-600">{book.author}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;