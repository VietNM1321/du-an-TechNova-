import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Slider from "react-slick";
import { ChevronLeft, ChevronRight } from "lucide-react";
import bannerImg from "../assets/benner3.png";
import BookCard from "../components/bookcard";
import SectionTitle from "../components/sectiontitle";

function Home() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // mỗi trang hiển thị 5 danh mục
  const sliderRefs = useRef({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch dữ liệu danh mục + sách
  const fetchData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const resCat = await axios.get(
        "http://localhost:5000/api/category?limit=1000&sort=createdAt&order=asc"
      );
      const cats = resCat.data.categories || [];

      const dataWithBooks = await Promise.all(
        cats.map(async (cat) => {
          const resBooks = await axios.get(
            `http://localhost:5000/api/books?category=${cat.name}`
          );
          return { ...cat, books: resBooks.data.books || [] };
        })
      );

      setCategories(dataWithBooks);
    } catch (err) {
      console.error("❌ Lỗi khi tải dữ liệu:", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Polling tự động mỗi 5s nếu tab active
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchData(true);
      }
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // Cập nhật khi tab trở lại active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchData(true);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Slider controls
  const nextSlide = (id) => sliderRefs.current[id]?.slickNext();
  const prevSlide = (id) => sliderRefs.current[id]?.slickPrev();

  // Lọc danh mục theo selected category
  const filteredCategories = selectedCategory
    ? categories.filter((cat) => cat.name === selectedCategory)
    : categories;

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedCategories = filteredCategories.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset về trang 1 khi thay đổi filter
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen p-5">
      {/* Banner */}
      <section className="relative rounded-2xl overflow-hidden shadow-xl ring-1 ring-slate-100 mb-16 h-64 md:h-96">
        <img
          src={bannerImg}
          alt="banner"
          className="w-full h-full object-cover brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 flex flex-col justify-center items-center text-white text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 drop-shadow-lg tracking-tight">
            📚 Chào mừng đến với{" "}
            <span className="text-yellow-300">Thư Viện Sách Số</span>
          </h1>
          <p className="text-lg md:text-xl font-light tracking-wide max-w-3xl mx-auto">
            Khám phá hàng ngàn tựa sách đa dạng & truyền cảm hứng
          </p>
        </div>
      </section>

      {/* Filter category */}
      <div className="container mx-auto px-4 mb-10">
        <div className="flex flex-wrap items-center gap-3 justify-center">
          <button
            onClick={() => setSelectedCategory("")}
            className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
              selectedCategory === ""
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg scale-105"
                : "bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 ring-1 ring-slate-300 hover:shadow-md"
            }`}
          >
            Tất cả
          </button>
          {[...new Set(categories.map((c) => c.name))].map((name) => (
            <button
              key={name}
              onClick={() => setSelectedCategory(name)}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
                selectedCategory === name
                  ? "bg-gradient-to-r from-pink-500 to-pink-400 text-white shadow-lg scale-105"
                  : "bg-white text-slate-700 hover:bg-pink-50 hover:text-pink-600 ring-1 ring-slate-300 hover:shadow-md"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      {displayedCategories.length > 0 ? (
        displayedCategories.map((cat, idx) => (
          <section
            key={cat._id}
            className="container mx-auto px-4 mb-20 relative"
          >
            <SectionTitle
              icon="📘"
              title={cat.name}
              color={idx % 2 === 0 ? "text-blue-600" : "text-pink-500"}
            />

            {/* Layout theo từng danh mục */}
            {cat.name.toLowerCase().includes("thiếu nhi") ? (
              <div className="relative">
                <Slider
                  ref={(el) => (sliderRefs.current[cat._id] = el)}
                  infinite
                  speed={600}
                  slidesToShow={3}
                  slidesToScroll={1}
                  arrows={false}
                  autoplay
                  autoplaySpeed={3500}
                  responsive={[
                    { breakpoint: 1024, settings: { slidesToShow: 2 } },
                    { breakpoint: 768, settings: { slidesToShow: 1 } },
                  ]}
                >
                  {cat.books.map((book) => (
                    <div key={book._id} className="px-3">
                      <div className="transition-transform duration-300 hover:-translate-y-3 hover:rotate-1 hover:shadow-xl rounded-xl overflow-hidden">
                        <BookCard
                          book={book}
                          btnColor="bg-pink-500 hover:bg-pink-600"
                        />
                      </div>
                    </div>
                  ))}
                </Slider>
                <button
                  onClick={() => prevSlide(cat._id)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md text-pink-600 p-3 rounded-full shadow-lg hover:scale-110 transition z-10"
                >
                  <ChevronLeft size={26} />
                </button>
                <button
                  onClick={() => nextSlide(cat._id)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md text-pink-600 p-3 rounded-full shadow-lg hover:scale-110 transition z-10"
                >
                  <ChevronRight size={26} />
                </button>
              </div>
            ) : cat.name.toLowerCase().includes("kinh tế") ||
              cat.name.toLowerCase().includes("đạo đức") ? (
              <div className="relative">
                <Slider
                  ref={(el) => (sliderRefs.current[cat._id] = el)}
                  infinite
                  speed={600}
                  slidesToShow={4}
                  slidesToScroll={1}
                  arrows={false}
                  autoplay
                  autoplaySpeed={4000}
                  dots
                  appendDots={(dots) => (
                    <div className="mt-6">
                      <ul className="flex justify-center gap-2">{dots}</ul>
                    </div>
                  )}
                  customPaging={() => (
                    <div className="w-3 h-3 bg-slate-300 rounded-full hover:bg-blue-500 transition"></div>
                  )}
                  responsive={[
                    { breakpoint: 1024, settings: { slidesToShow: 2 } },
                    { breakpoint: 768, settings: { slidesToShow: 1 } },
                  ]}
                >
                  {cat.books.map((book) => (
                    <div key={book._id} className="px-3">
                      <div className="transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl rounded-xl overflow-hidden">
                        <BookCard
                          book={book}
                          btnColor="bg-blue-600 hover:bg-blue-700"
                        />
                      </div>
                    </div>
                  ))}
                </Slider>
                <button
                  onClick={() => prevSlide(cat._id)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur text-blue-600 p-3 rounded-full shadow-lg hover:scale-110 transition z-10"
                >
                  <ChevronLeft size={26} />
                </button>
                <button
                  onClick={() => nextSlide(cat._id)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur text-blue-600 p-3 rounded-full shadow-lg hover:scale-110 transition z-10"
                >
                  <ChevronRight size={26} />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {cat.books.map((book) => (
                  <div
                    key={book._id}
                    className="transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl rounded-xl overflow-hidden"
                  >
                    <BookCard
                      book={book}
                      btnColor="bg-yellow-400 hover:bg-yellow-500"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        ))
      ) : (
        <div className="container mx-auto px-4 mb-10">
          <div className="text-center py-20 bg-white/80 backdrop-blur rounded-2xl shadow-xl ring-1 ring-slate-100">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Không tìm thấy danh mục
            </h3>
            <p className="text-slate-600">
              Không có danh mục nào phù hợp với bộ lọc của bạn.
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredCategories.length > itemsPerPage && totalPages > 1 && (
        <div className="container mx-auto px-4 mb-10 mt-8">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-12 h-12 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center ${
                  currentPage === page
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg scale-110"
                    : "bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 ring-1 ring-slate-300 hover:shadow-md hover:scale-105"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;

