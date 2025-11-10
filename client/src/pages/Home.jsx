import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Slider from "react-slick";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import bannerImg from "../assets/benner3.png";
import BookCard from "../components/bookcard";
import SectionTitle from "../components/sectiontitle";

function Home() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const sliderRefs = useRef({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resCat = await axios.get("http://localhost:5000/api/category");
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
        console.error("Lỗi khi tải dữ liệu:", err);
      }
    };
    fetchData();
  }, []);

  const nextSlide = (id) => sliderRefs.current[id]?.slickNext();
  const prevSlide = (id) => sliderRefs.current[id]?.slickPrev();

  // Lọc danh mục theo category được chọn
  const filteredCategories = selectedCategory
    ? categories.filter((cat) => cat.name === selectedCategory)
    : categories;

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedCategories = filteredCategories.slice(startIndex, endIndex);

  // Reset về trang 1 khi thay đổi category filter
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // Hàm xử lý chuyển trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-5 bg-gradient-to-b from-gray-50 to-white min-h-screen">
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
      <div className="container mx-auto px-4 mb-10">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory("")}
            className={`${selectedCategory === "" ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-700 hover:bg-slate-50 ring-slate-200"} px-3 py-1.5 rounded-full text-sm font-medium transition ring-1`}
          >
            Tất cả
          </button>
          {[...new Set(categories.map((c) => c.name))].map((name) => (
            <button
              key={name}
              onClick={() => setSelectedCategory(name)}
              className={`${selectedCategory === name ? "bg-blue-600 text-white ring-blue-600" : "bg-white text-slate-700 hover:bg-slate-50 ring-slate-200"} px-3 py-1.5 rounded-full text-sm font-medium transition ring-1`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      {displayedCategories.length > 0 ? (
        <>
          {displayedCategories.map((cat, index) => {
            const globalIndex = startIndex + index;
            return (
              <section key={cat._id} className="container mx-auto px-4 mb-20 relative">
                <div className="flex justify-between items-center mb-6">
                  <SectionTitle
                    icon="📘"
                    title={cat.name}
                    color={globalIndex % 2 === 0 ? "text-blue-600" : "text-pink-500"}
                  />
                </div>

                {/* Slider hoặc Grid theo từng danh mục */}
                {cat.name.toLowerCase().includes("thiếu nhi") ? (
                  <div className="relative">
                    <Slider
                      ref={(el) => (sliderRefs.current[cat._id] = el)}
                      infinite
                      speed={600}
                      slidesToShow={3}
                      slidesToScroll={1}
                      arrows={false}
                      autoplay={false}
                      responsive={[
                        { breakpoint: 1024, settings: { slidesToShow: 2 } },
                        { breakpoint: 768, settings: { slidesToShow: 1 } },
                      ]}
                    >
                      {cat.books.map((book) => (
                        <div key={book._id} className="px-4">
                          <div className="transition-transform duration-300 hover:-translate-y-2">
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
                      className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur text-pink-600 p-3 rounded-full shadow-lg ring-1 ring-slate-200 hover:bg-white transition z-10"
                    >
                      <ChevronLeft size={26} />
                    </button>
                    <button
                      onClick={() => nextSlide(cat._id)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur text-pink-600 p-3 rounded-full shadow-lg ring-1 ring-slate-200 hover:bg-white transition z-10"
                    >
                      <ChevronRight size={26} />
                    </button>
                  </div>
                ) : cat.name.toLowerCase().includes("kinh tế") ? (
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
                        <div style={{ marginTop: "20px" }}>
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
                        <div key={book._id} className="px-4">
                          <div className="transition-transform duration-300 hover:-translate-y-2">
                            <BookCard
                              book={book}
                              btnColor="bg-blue-500 hover:bg-blue-600"
                            />
                          </div>
                        </div>
                      ))}
                    </Slider>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {cat.books.map((book) => (
                      <div
                        key={book._id}
                        className="transition-transform duration-300 hover:-translate-y-2"
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
            );
          })}

          {/* Phân trang - Hiển thị khi có từ 5 danh mục trở lên */}
          {filteredCategories.length >= itemsPerPage && (
            <div className="container mx-auto px-4 mb-10 mt-8">
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl ring-1 ring-slate-200 p-6">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                {/* Nút về trang đầu */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === 1
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 ring-1 ring-slate-200 hover:ring-blue-300 shadow-sm"
                  }`}
                  title="Trang đầu"
                >
                  <ChevronsLeft size={20} />
                </button>

                {/* Nút trang trước */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === 1
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 ring-1 ring-slate-200 hover:ring-blue-300 shadow-sm"
                  }`}
                  title="Trang trước"
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Hiển thị số trang */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Chỉ hiển thị một số trang xung quanh trang hiện tại
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                          currentPage === page
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg ring-2 ring-blue-300 scale-105"
                            : "bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 ring-1 ring-slate-200 hover:ring-blue-300 shadow-sm"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-2 text-slate-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                {/* Nút trang sau */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === totalPages
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 ring-1 ring-slate-200 hover:ring-blue-300 shadow-sm"
                  }`}
                  title="Trang sau"
                >
                  <ChevronRight size={20} />
                </button>

                {/* Nút đến trang cuối */}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === totalPages
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 ring-1 ring-slate-200 hover:ring-blue-300 shadow-sm"
                  }`}
                  title="Trang cuối"
                >
                  <ChevronsRight size={20} />
                </button>
              </div>

                {/* Hiển thị thông tin trang */}
                <div className="text-center mt-4 text-slate-600 text-sm w-full">
                  <span className="font-medium">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <span className="mx-2">•</span>
                  <span>
                    Hiển thị {startIndex + 1} - {Math.min(endIndex, filteredCategories.length)} trong tổng số {filteredCategories.length} danh mục
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
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
    </div>
  );
}

export default Home;
