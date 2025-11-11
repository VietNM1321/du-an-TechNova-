import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BookList = () => {
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/api/authors")
      .then((res) => setAuthors(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Lỗi lấy tác giả:", err));

    axios.get("http://localhost:5000/api/category?sort=createdAt&order=asc")
      .then((res) => {
        const cats = res.data.categories || res.data;
        setCategories(Array.isArray(cats) ? cats : []);
      })
      .catch((err) => console.error("Lỗi lấy danh mục:", err));
  }, []);

  const handleCategoryClick = async (catId) => {
    setSelectedType({ type: "category", id: catId });
    try {
      const res = await axios.get(
        `http://localhost:5000/api/books?category=${catId}`
      );
      setBooks(res.data);
    } catch (err) {
      console.error("Lỗi lấy sách theo thể loại:", err);
    }
  };
  useEffect(() => {
    const fetchAllBooks = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/books");
        setBooks(res.data);
      } catch (err) {
        console.error("Lỗi lấy sách:", err);
      }
    };

    fetchAllBooks();  
  }, []);
  const handleAuthorClick = async (authorId) => {
    setSelectedType({ type: "author", id: authorId });
    try {
      const res = await axios.get(`http://localhost:5000/api/books?authors=${authorId}`);
      setBooks(res.data);
    } catch (err) {
      console.error("Lỗi lấy sách theo tác giả:", err);
    }
  };
  const handleViewDetail = (bookId) => {
    navigate(`/books/${bookId}`);
  };
  return (
    <div className="container mx-auto py-6 px-4 flex gap-6">
      <aside className="w-1/4 bg-white rounded-xl shadow p-5 h-fit sticky top-24">
        <h2 className="text-lg font-semibold mb-3 border-b pb-2">
          📚 Thể loại sách
        </h2>
        <ul className="space-y-2 mb-6">
          {categories.map((cat) => (
            <li
              key={cat._id}
              onClick={() => handleCategoryClick(cat._id)}
              className="cursor-pointer text-gray-700 hover:text-blue-600 transition"
            >
              {cat.name}
            </li>
          ))}
        </ul>

        <h2 className="text-lg font-semibold mb-3 border-b pb-2">
          ✍️ Tác giả
        </h2>
        <ul className="space-y-2">
          {authors.map((author) => (
            <li
              key={author._id}
              onClick={() => handleAuthorClick(author._id)}
              className="cursor-pointer text-gray-700 hover:text-blue-600 transition"
            >
              {author.name}
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex-1 bg-gray-50 p-5 rounded-xl shadow-inner min-h-[500px]">
        {books.length > 0 ? (
          <div>
            <h3 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
              <span role="img" aria-label="book">📖</span>
              {selectedType?.type === "category"
                ? "Sách theo thể loại"
                : "Sách theo tác giả"}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {books.map((book) => (
                <div
                  key={book._id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-lg overflow-hidden transition-transform transform hover:-translate-y-1"
                >
                  <div className="aspect-[3/4] w-full overflow-hidden">
                    <img
                      src={
                        Array.isArray(book.images) && book.images.length > 0
                          ? `http://localhost:5000${book.images[0]}`
                          : "/default-book.jpg"
                      }
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
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-20 text-lg">
            Chọn thể loại hoặc tác giả để xem danh sách sách 📚
          </p>
        )}
      </main>
    </div>
  );
};

export default BookList;
