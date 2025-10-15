import { useEffect, useState } from "react";

const BookList = () => {
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);


  useEffect(() => {

    fetch("http://localhost:5000/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Lỗi lấy danh mục:", err));


    fetch("http://localhost:5000/authors")
      .then((res) => res.json())
      .then((data) => setAuthors(data))
      .catch((err) => console.error("Lỗi lấy tác giả:", err));
  }, []);

  return (
    <div className="container mx-auto py-6 px-4 flex gap-6">

      <aside className="w-1/4 bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3 border-b pb-2">
          Thể loại sách
        </h2>
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li
              key={cat._id}
              className="cursor-pointer text-gray-700 hover:text-blue-600"
            >
              {cat.name}
            </li>
          ))}
        </ul>
         </aside>
      <aside className="w-1/4 bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3 border-b pb-2">
          tác giả
        </h2>
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li
              key={cat._id}
              className="cursor-pointer text-gray-700 hover:text-blue-600"
            >
              {cat.name}
            </li>
          ))}
        </ul>

        {/* <h2 className="text-lg font-semibold mt-6 mb-3 border-b pb-2">
          Tác giả
        </h2>
        <ul className="space-y-2">
          {authors.map((author) => (
            <li
              key={author._id}
              className="cursor-pointer text-gray-700 hover:text-blue-600"
            >
              {author.name}
            </li>
          ))}
        </ul> */}
      </aside>

      {/* Cột bên phải: Sách (tạm để trống, sẽ thêm sau) */}
      <main className="flex-1 bg-gray-50 p-4 rounded-lg shadow-inner">
        <p className="text-gray-500 text-center">
          Chọn thể loại hoặc tác giả để xem sách
        </p>
      </main>
    </div>
  );
};

export default BookList;
