import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";

const AllBook = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filter states
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [q, setQ] = useState("");

  // Load data
  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([
      fetch("http://localhost:5000/api/books").then(r => r.ok ? r.json() : Promise.reject("books fetch failed")),
      fetch("http://localhost:5000/api/category").then(r => r.ok ? r.json() : Promise.reject("categories fetch failed")),
      // authors endpoint may differ; try /api/author then fallback to derived list from books
      fetch("http://localhost:5000/api/author").then(r => r.ok ? r.json() : [])
    ])
      .then(([booksData, catsData, authorsData]) => {
        setBooks(booksData || []);
        setCategories(catsData || []);
        // authorsData might be [] if endpoint missing; derive later if needed
        setAuthors(authorsData || []);
      })
      .catch(err => {
        console.error(err);
        setError("Không thể tải dữ liệu. Kiểm tra API.");
      })
      .finally(() => setLoading(false));
  }, []);

  // If authors endpoint returned empty, derive unique authors from books
  const derivedAuthors = useMemo(() => {
    if (authors && authors.length > 0) return authors;
    const setA = new Map();
    books.forEach(b => {
      // try several shapes: b.author (string), b.author.name, b.authors array
      if (!b) return;
      if (Array.isArray(b.authors)) {
        b.authors.forEach(a => {
          const name = typeof a === "string" ? a : a?.name;
          if (name) setA.set(name, name);
        });
      } else {
        const name = typeof b.author === "string" ? b.author : b.author?.name;
        if (name) setA.set(name, name);
      }
    });
    return Array.from(setA.keys()).map(n => ({ name: n }));
  }, [authors, books]);

  // filter books based on selected filters and search query
  const filteredBooks = useMemo(() => {
    const term = q.trim().toLowerCase();
    return books.filter(b => {
      if (!b) return false;
      // get book title, author name, category name safely
      const title = (b.title || b.name || "").toString().toLowerCase();
      const catName = (typeof b.category === "string" ? b.category : b.category?.name) || "";
      const authorName = Array.isArray(b.authors)
        ? b.authors.map(a => (typeof a === "string" ? a : a?.name)).join(" ")
        : (typeof b.author === "string" ? b.author : b.author?.name) || "";

      if (selectedCategory && selectedCategory !== "" && selectedCategory !== "all") {
        if (catName !== selectedCategory && catName.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      }
      if (selectedAuthor && selectedAuthor !== "" && selectedAuthor !== "all") {
        if (!authorName.toLowerCase().includes(selectedAuthor.toLowerCase())) return false;
      }
      if (term) {
        if (!title.includes(term) && !authorName.toLowerCase().includes(term)) return false;
      }
      return true;
    });
  }, [books, selectedCategory, selectedAuthor, q]);

  if (loading) {
    return (
      <>
        <Header selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
        <main className="container mx-auto px-6 py-20">
          <p>Đang tải sách...</p>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
        <main className="container mx-auto px-6 py-20">
          <p className="text-red-600">{error}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
      <main className="container mx-auto px-6 py-20">
        <h1 className="text-2xl font-semibold mb-4">Toàn bộ sách</h1>

        {/* Filters */}
        <section className="mb-6 flex flex-col md:flex-row gap-3 items-start md:items-center">
          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">Tất cả thể loại</option>
              {categories.map(c => (
                <option key={c._id || c.name} value={c.name || c}>
                  {c.name || c}
                </option>
              ))}
            </select>

            <select
              value={selectedAuthor || ""}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">Tất cả tác giả</option>
              {derivedAuthors.map(a => (
                <option key={a._id || a.name} value={a.name || a}>
                  {a.name || a}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 w-full md:w-1/2">
            <input
              type="text"
              placeholder="Tìm theo tên sách hoặc tác giả..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="flex-1 border rounded px-3 py-2"
            />
            <button
              onClick={() => { setQ(""); setSelectedAuthor(""); setSelectedCategory(""); }}
              className="bg-gray-200 px-4 py-2 rounded"
            >
              Xóa
            </button>
          </div>
        </section>

        {/* Results */}
        <section>
          <p className="mb-4 text-sm text-gray-600">
            Hiển thị {filteredBooks.length} / {books.length} sách
          </p>

          {filteredBooks.length === 0 ? (
            <div className="p-6 border rounded text-center">Không tìm thấy sách phù hợp.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBooks.map(book => {
                const id = book._id || book.id;
                const title = book.title || book.name || "Không có tiêu đề";
                const cover = book.cover || book.image || "";
                const authorName = Array.isArray(book.authors)
                  ? book.authors.map(a => (typeof a === "string" ? a : a?.name)).join(", ")
                  : (typeof book.author === "string" ? book.author : book.author?.name) || "Không rõ";
                const price = book.price ? `${book.price}₫` : null;

                return (
                  <Link to={`/books/${id}`} key={id} className="block border rounded-lg overflow-hidden hover:shadow-lg">
                    <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                      {cover ? <img src={cover} alt={title} className="object-cover w-full h-full" /> : <div className="text-gray-400">No Image</div>}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm">{title}</h3>
                      <p className="text-xs text-gray-500">{authorName}</p>
                      {price && <p className="text-sm text-blue-600 mt-2">{price}</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default AllBook;