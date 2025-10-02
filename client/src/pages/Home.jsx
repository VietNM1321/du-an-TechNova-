function Home() {
  return (
    <div className="p-5">
      {/* Tiêu đề */}

      {/* Danh sách sản phẩm */}
      <section className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          📚 Sản phẩm nổi bật
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
            <p className="text-red-500 font-bold text-lg mb-3">120.000₫</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">
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
            <p className="text-red-500 font-bold text-lg mb-3">95.000₫</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">
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
            <p className="text-red-500 font-bold text-lg mb-3">150.000₫</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">
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
            <p className="text-red-500 font-bold text-lg mb-3">80.000₫</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">
              Thêm vào giỏ
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
