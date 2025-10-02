const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-800 to-blue-900 text-white mt-10">
      {/* Nội dung footer */}
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-6 py-10">
        
        {/* Logo + giới thiệu */}
        <div>
          <div className="flex items-center gap-3 mb-4 cursor-pointer">
            <img src="/logo.png" alt="logo" className="w-14" />
            <span className="font-bold text-xl">Thư Viện Sách</span>
          </div>
          <p className="text-gray-300 text-sm leading-6">
            Khám phá kho tri thức khổng lồ. Đọc sách mọi lúc, mọi nơi cùng thư viện online của chúng tôi.
          </p>
        </div>

        {/* Liên kết nhanh */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Liên kết nhanh</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li><a href="/" className="hover:text-yellow-300">Trang chủ</a></li>
            <li><a href="/about" className="hover:text-yellow-300">Giới thiệu</a></li>
            <li><a href="/news" className="hover:text-yellow-300">Tin tức</a></li>
            <li><a href="/policies" className="hover:text-yellow-300">Chính sách</a></li>
            <li><a href="/contact" className="hover:text-yellow-300">Liên hệ</a></li>
          </ul>
        </div>

        {/* Thông tin liên hệ */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Liên hệ</h3>
          <ul className="space-y-3 text-gray-300 text-sm">
            <li className="flex items-center gap-2">
              📍 Hà Nội, Việt Nam
            </li>
            <li className="flex items-center gap-2">
              📞 0123 456 789
            </li>
            <li className="flex items-center gap-2">
              ✉️ contact@thuvien.com
            </li>
          </ul>
        </div>

        {/* Mạng xã hội */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Kết nối với chúng tôi</h3>
          <div className="flex gap-4 text-2xl">
            <a href="#" className="hover:text-yellow-300">🌐</a>
            <a href="#" className="hover:text-yellow-300">🐦</a>
            <a href="#" className="hover:text-yellow-300">📸</a>
          </div>
        </div>
      </div>

      {/* Bản quyền */}
      <div className="border-t border-blue-700 py-4 text-center text-gray-300 text-sm">
        Copyright &copy; 2025 Thư Viện Sách. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
