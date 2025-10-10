import "slick-carousel/slick/slick.css";
import React, {useEffect, useState} from "react";
import axios from "axios"
import bannerImg from "../assets/benner3.png";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
function Home() {
  const [books, setbooks] = useState([]);
  const [booksTheThao, setBooksTheThao] = useState([]);
  const [booksThieuNhi, setBooksThieuNhi] = useState([]);
  const [booksPhapLuat, setBooksPhapLuat] = useState([]);
  useEffect(()=> {
    const fetchbooks = async() => {
      
      try {
        const res = await axios.get("http://localhost:5000/api/books?category=sách Kinh tế");
        setbooks(res.data);
        const resTheThao = await axios.get(
          "http://localhost:5000/api/books?category=sách Thể thao"
        );
        setBooksTheThao(resTheThao.data);
        const resThieuNhi = await axios.get(
          "http://localhost:5000/api/books?category=sách Thiếu nhi"
        );
        setBooksThieuNhi(resThieuNhi.data);
        const resPhapLuat = await axios.get("http://localhost:5000/api/books?category=sách Pháp luật");
        setBooksPhapLuat(resPhapLuat.data);
      } catch (error) {
         console.error("Lỗi khi lấy sách:", error);
      }
      
    }
    fetchbooks();
  },[])
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1 },
      },
    ],
  };
  return (
    <div className="p-5">
        <section
         className="relative rounded-xl overflow-hidden shadow-lg mb-10 h-[300px] md:h-[400px] flex items-center justify-center"
         style={{
          backgroundImage:
            "url('https://png.pngtree.com/background/20210710/original/pngtree-creative-synthesis-simple-book-education-and-training-background-picture-image_1048845.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        >
        <div className="absolute inset-0 bg-black/25"></div>
        <div className="relative text-center px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-blue-600">
            📚 Chào mừng đến với Thư Viện Sách Số
          </h1>
          <p className="text-blue-600 text-lg max-w-2xl mx-auto">
            Khám phá kho sách đa dạng – nơi tri thức được chia sẻ và lan tỏa.  
            Mỗi trang sách là một hành trình khám phá mới.
          </p>
        </div>
      </section>
      <section className="container mx-auto px-4 mb-20">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">📖 Sách kinh tế</h2>
        {books.length === 0 ? (
          <p>Đang tải sách...</p>
        ) : (
          <Slider {...sliderSettings}>
            {books.map((book) => {
              const averageRating =
                book.reviews && book.reviews.length > 0
                  ? (book.reviews.reduce((acc, r) => acc + r.rating, 0) / book.reviews.length).toFixed(1)
                  : "Chưa có";

              return (
                <div key={book._id} className="px-2">
                  <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-4">
                    <img
                      src={book.images[0] || "https://via.placeholder.com/150x200?text=No+Image"}
                      alt={book.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{book.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      Tác giả: {book.author?.name || "Chưa rõ"}
                    </p>
                    <div className="flex justify-between text-sm mb-3">
                      <p className="text-blue-600 font-medium">👁️ {book.views} lượt đọc</p>
                      <p className="text-yellow-500 font-medium">⭐ {averageRating} / 5</p>
                    </div>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
                      Đọc ngay
                    </button>
                  </div>
                </div>
              );
            })}
          </Slider>
        )}
      </section>
      <section className="container mx-auto px-4 mb-20">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">🏃‍♂️ Sách thể thao</h2>
        {booksTheThao.length === 0 ? (
          <p>Đang tải sách thể thao...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {booksTheThao.map((book) => {
              const averageRating =
                book.reviews && book.reviews.length > 0
                  ? (
                      book.reviews.reduce((acc, r) => acc + r.rating, 0) /
                      book.reviews.length
                    ).toFixed(1)
                  : "Chưa có";

              return (
                <div
                  key={book._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-4"
                >
                  <img
                    src={
                      book.images[0] ||
                      "https://via.placeholder.com/150x200?text=No+Image"
                    }
                    alt={book.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {book.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Tác giả: {book.author?.name || "Chưa rõ"}
                  </p>
                  <div className="flex justify-between text-sm mb-3">
                    <p className="text-blue-600 font-medium">
                      👁️ {book.views || 0} lượt đọc
                    </p>
                    <p className="text-yellow-500 font-medium">
                      ⭐ {averageRating} / 5
                    </p>
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
                    Đọc ngay
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
      <section
          className="container mx-auto px-4 mb-20 relative rounded-xl overflow-hidden shadow-lg"
          style={{
            backgroundImage:
              "url('https://i.pinimg.com/originals/0e/88/2c/0e882cb6cd424a1a43bf572912a86425.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
      >
          {/* Lớp mờ overlay để dễ đọc chữ */}
          <div className="absolute inset-0 bg-black/40"></div>

          <div className="relative z-10 py-10">
            <h2 className="text-3xl font-bold mb-6 text-center text-pink-300">
              💖 Sách thiếu nhi
            </h2>

            {booksThieuNhi.length === 0 ? (
              <p className="text-center text-white">Đang tải sách thiếu nhi...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {booksThieuNhi.map((book) => {
                  const averageRating =
                    book.reviews && book.reviews.length > 0
                      ? (
                          book.reviews.reduce((acc, r) => acc + r.rating, 0) /
                          book.reviews.length
                        ).toFixed(1)
                      : "Chưa có";

                  return (
                    <div
                      key={book._id}
                      className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition p-4 flex flex-col"
                    >
                      <img
                        src={
                          book.images[0] ||
                          "https://via.placeholder.com/150x200?text=No+Image"
                        }
                        alt={book.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {book.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        Tác giả: {book.author?.name || "Chưa rõ"}
                      </p>
                      <div className="flex justify-between text-sm mb-3">
                        <p className="text-blue-600 font-medium">
                          👁️ {book.views || 0} lượt đọc
                        </p>
                        <p className="text-yellow-500 font-medium">
                          ⭐ {averageRating} / 5
                        </p>
                      </div>
                      <button className="mt-auto bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg">
                        Đọc ngay
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      </section>
      <section
          className="container mx-auto px-4 mb-20 relative rounded-xl overflow-hidden shadow-lg h-[300px] md:h-[400px] flex items-center justify-center"
            style={{
              backgroundImage: `url(${bannerImg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black/10"></div>

      </section>
      <section className="container mx-auto px-4 mb-20">
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-10 shadow-lg  text-white">
          <h2 className="text-3xl font-bold mb-2">⚖️ Sách Pháp Luật</h2>
          <p className="text-white/90 mb-8">
            Những cuốn sách được đọc và đánh giá cao nhất trong tháng này.
          </p>

          {booksPhapLuat.length === 0 ? (
            <p className="text-center text-white">Đang tải sách pháp luật...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {booksPhapLuat.map((book) => {
                const averageRating =
                  book.reviews && book.reviews.length > 0
                    ? (
                        book.reviews.reduce((acc, r) => acc + r.rating, 0) /
                        book.reviews.length
                      ).toFixed(1)
                    : "Chưa có";

                return (
                  <div
                    key={book._id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-4"
                  >
                    <img
                      src={
                        book.images[0] ||
                        "https://via.placeholder.com/150x200?text=No+Image"
                      }
                      alt={book.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      Tác giả: {book.author?.name || "Chưa rõ"}
                    </p>
                    <div className="flex justify-between text-sm mb-3">
                      <p className="text-blue-600 font-medium">
                        👁️ {book.views || 0} lượt đọc
                      </p>
                      <p className="text-yellow-500 font-medium">
                        ⭐ {averageRating} / 5
                      </p>
                    </div>
                    <button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg">
                      Đọc ngay
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
