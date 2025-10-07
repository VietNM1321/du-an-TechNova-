// src/components/Banner.jsx
import React from "react";

const Banner = () => {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background image (bỏ hoặc thay bằng gradient nếu không có ảnh) */}
      <div
        className="w-full h-[420px] md:h-[520px] bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/banner.jpg')",
        }}
      />

      {/* Overlay & content */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#4b2e16cc] to-transparent flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#fffaf4] drop-shadow-md">
            Chào mừng đến với <span className="text-[#ffe5b4]">Thư Viện Sách TechNova</span>
          </h1>
          <p className="mt-4 text-sm md:text-lg text-[#f3e5d0] max-w-2xl mx-auto">
            Khám phá hàng nghìn đầu sách hay — học hỏi, giải trí và mở rộng tầm nhìn mỗi ngày.
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <a
              href="/books"
              className="inline-block bg-[#8b5e34] hover:bg-[#a67c52] text-white font-medium py-3 px-6 rounded-full shadow-lg transition"
            >
              📚 Khám phá ngay
            </a>
            <a
              href="/borrow"
              className="inline-block bg-[#f9f4ef] hover:bg-[#fffaf0] text-[#8b5e34] font-medium py-3 px-6 rounded-full border border-[#c89f7b] transition"
            >
              🔖 Đặt mượn
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
