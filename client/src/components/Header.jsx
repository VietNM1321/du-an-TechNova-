import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCartShopping,
  faClock,
  faDashboard,
  faHistory,
  faLocationDot,
  faMagnifyingGlass,
  faSignIn,
  faSignOut,
  faUser,
} from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <header className="w-full shadow-md bg-[#f9f4ef]">
      {/* Top bar */}
      <div className="container mx-auto flex justify-between items-center py-3 px-4">
        {/* Logo */}
        <div className="text-2xl font-bold text-[#5a4634] cursor-pointer select-none">
          <Link to="/" className="hover:text-[#a67c52] transition">
            LOGO Books
          </Link>
        </div>

        {/* Search */}
        <form className="relative w-72 max-w-md hidden md:block">
          <input
            type="text"
            placeholder="Tìm sách..."
            className="w-full border border-[#d3b89f] rounded-full py-2 pl-4 pr-10 text-sm focus:ring-2 focus:ring-[#a67c52] focus:outline-none"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#a67c52] hover:text-[#c89f7b]"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </form>

        {/* Info */}
        <div className="flex items-center gap-6 text-[#5a4634]">
          <div className="flex items-center gap-1 text-sm hover:text-[#a67c52] cursor-pointer">
            <FontAwesomeIcon icon={faLocationDot} /> Hà Nội
          </div>
          <div className="flex items-center gap-1 text-sm hover:text-[#a67c52] cursor-pointer">
            <FontAwesomeIcon icon={faClock} /> 24H
          </div>

          {/* User dropdown */}
          <div className="relative group cursor-pointer">
            <div className="p-2 hover:text-[#a67c52]">
              <FontAwesomeIcon icon={faUser} /> user
            </div>
            <ul className="absolute right-0 mt-2 hidden group-hover:block bg-white rounded-lg shadow-lg z-20 min-w-[200px] border border-[#d3b89f]">
              <li>
                <Link
                  to="/admin"
                  className="block px-4 py-2 text-[#5a4634] hover:bg-[#f1e3d3]"
                >
                  <FontAwesomeIcon icon={faDashboard} /> Admin Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/user/profile"
                  className="block px-4 py-2 text-[#5a4634] hover:bg-[#f1e3d3]"
                >
                  <FontAwesomeIcon icon={faUser} /> Tài khoản
                </Link>
              </li>
              <li>
                <Link
                  to="/user/carts"
                  className="block px-4 py-2 text-[#5a4634] hover:bg-[#f1e3d3]"
                >
                  <FontAwesomeIcon icon={faCartShopping} /> Giỏ hàng
                </Link>
              </li>
              <li>
                <Link
                  to="/books/history"
                  className="block px-4 py-2 text-[#5a4634] hover:bg-[#f1e3d3]"
                >
                  <FontAwesomeIcon icon={faHistory} /> Lịch sử mua sách
                </Link>
              </li>
              <li>
                <p className="block px-4 py-2 text-[#5a4634] hover:bg-[#f1e3d3] cursor-pointer">
                  <FontAwesomeIcon icon={faSignOut} /> Đăng xuất
                </p>
              </li>
            </ul>
          </div>

          {/* Nếu chưa login thì show Login */}
          {/* 
          <Link to="/login" className="hover:text-[#a67c52] text-sm">
            <FontAwesomeIcon icon={faSignIn} /> Đăng nhập
          </Link> 
          */}
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-[#a67c52]">
        <ul className="container mx-auto flex flex-wrap gap-4 items-center px-4">
          <li>
            <Link
              to="/"
              className="text-white px-4 py-3 block hover:bg-[#c89f7b] rounded transition"
            >
              Trang chủ
            </Link>
          </li>
          <li>
            <Link
              to="/books"
              className="text-white px-4 py-3 block hover:bg-[#c89f7b] rounded transition"
            >
              Sách
            </Link>
          </li>
          <li>
            <Link
              to="/authors"
              className="text-white px-4 py-3 block hover:bg-[#c89f7b] rounded transition"
            >
              Tác giả
            </Link>
          </li>
          
          <li>
            <Link
              to="/about"
              className="text-white px-4 py-3 block hover:bg-[#c89f7b] rounded transition"
            >
              Giới thiệu
            </Link>
          </li>
          <li>
            <Link
              to="/news"
              className="text-white px-4 py-3 block hover:bg-[#c89f7b] rounded transition"
            >
              Tin tức
            </Link>
          </li>
          <li>
            <Link
              to="/policies"
              className="text-white px-4 py-3 block hover:bg-[#c89f7b] rounded transition"
            >
              Chính sách
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className="text-white px-4 py-3 block hover:bg-[#c89f7b] rounded transition"
            >
              Liên hệ
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Header
