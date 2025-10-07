// src/pages/Home.jsx
import React from "react";
import Banner from "../components/Banner";

function Home() {
  return (
    <div className="bg-[#f9f4ef] min-h-screen">
      {/* Banner */}
      <Banner />

      <div className="p-5">
        {/* Sách Mới Xuất Bản */}
        <section className="container mx-auto px-4 py-6">
          <h2 className="text-center text-2xl font-semibold text-[#8b5e34] my-6">
            Sách Mới Xuất Bản
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Sản phẩm 1 */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-4">
              <img
                src="/images/book1.jpg"
                alt="Sách 1"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Tên Sách 1
              </h3>
              <p className="text-gray-600 text-sm mb-2">Tác giả: Nguyễn Văn A</p>
              <p className="text-[#a04b2f] font-bold text-lg mb-3">120.000₫</p>
              <button className="w-full bg-[#a67c52] hover:bg-[#8b5e34] text-white py-2 rounded-lg text-sm font-medium transition">
                Thêm vào giỏ
              </button>
            </div>

            {/* Sản phẩm 2 */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-4">
              <img
                src="/images/book2.jpg"
                alt="Sách 2"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Tên Sách 2
              </h3>
              <p className="text-gray-600 text-sm mb-2">Tác giả: Trần Thị B</p>
              <p className="text-[#a04b2f] font-bold text-lg mb-3">95.000₫</p>
              <button className="w-full bg-[#a67c52] hover:bg-[#8b5e34] text-white py-2 rounded-lg text-sm font-medium transition">
                Thêm vào giỏ
              </button>
            </div>

            {/* Sản phẩm 3 */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-4">
              <img
                src="/images/book3.jpg"
                alt="Sách 3"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Tên Sách 3
              </h3>
              <p className="text-gray-600 text-sm mb-2">Tác giả: Lê Văn C</p>
              <p className="text-[#a04b2f] font-bold text-lg mb-3">150.000₫</p>
              <button className="w-full bg-[#a67c52] hover:bg-[#8b5e34] text-white py-2 rounded-lg text-sm font-medium transition">
                Thêm vào giỏ
              </button>
            </div>

            {/* Sản phẩm 4 */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-4">
              <img
                src="/images/book4.jpg"
                alt="Sách 4"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Tên Sách 4
              </h3>
              <p className="text-gray-600 text-sm mb-2">Tác giả: Phạm Thị D</p>
              <p className="text-[#a04b2f] font-bold text-lg mb-3">80.000₫</p>
              <button className="w-full bg-[#a67c52] hover:bg-[#8b5e34] text-white py-2 rounded-lg text-sm font-medium transition">
                Thêm vào giỏ
              </button>
            </div>
          </div>
        </section>

        {/* Sách Bán Chạy */}
        <section className="container mx-auto px-4 py-6">
          <h2 className="text-center text-2xl font-semibold text-[#8b5e34] my-6">
            Sách Bán Chạy
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* copy same card 4 items */}
            {[1,2,3,4].map((i) => (
              <div key={`best-${i}`} className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-4">
                <img
                  src={`/images/book${i}.jpg`}
                  alt={`Sách ${i}`}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Tên Sách {i}
                </h3>
                <p className="text-gray-600 text-sm mb-2">Tác giả: Tác giả {i}</p>
                <p className="text-[#a04b2f] font-bold text-lg mb-3">{80 + i*10}.000₫</p>
                <button className="w-full bg-[#a67c52] hover:bg-[#8b5e34] text-white py-2 rounded-lg text-sm font-medium transition">
                  Thêm vào giỏ
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Sách Đề Cử */}
        <section className="container mx-auto px-4 py-6">
          <h2 className="text-center text-2xl font-semibold text-[#8b5e34] my-6">
            Sách Đề Cử
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map((i) => (
              <div key={`rec-${i}`} className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-4">
                <img
                  src={`/images/book${i}.jpg`}
                  alt={`Sách đề cử ${i}`}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Tên Sách Đề Cử {i}
                </h3>
                <p className="text-gray-600 text-sm mb-2">Tác giả: Tác giả {i}</p>
                <p className="text-[#a04b2f] font-bold text-lg mb-3">{90 + i*20}.000₫</p>
                <button className="w-full bg-[#a67c52] hover:bg-[#8b5e34] text-white py-2 rounded-lg text-sm font-medium transition">
                  Thêm vào giỏ
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
