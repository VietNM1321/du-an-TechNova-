import logo from '../assets/logo.png'
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
    <header className="w-full shadow-md bg-white">
      {/* Top bar */}
      <div className="container mx-auto flex justify-between items-center py-3 px-4">
        {/* Logo */}
        <div className="w-32 cursor-pointer">
          <Link to="/">
            <img src={logo} alt="logo" className="w-full object-contain" />
          </Link>
        </div>

        {/* Search */}
        <form
          action=""
          className="relative w-72 max-w-md hidden md:block"
        >
          <input
            type="text"
            placeholder="Tìm sách..."
            className="w-full border border-gray-300 rounded-full py-2 pl-4 pr-10 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </form>

        {/* Info */}
        <div className="flex items-center gap-6 text-gray-700">
          <div className="flex items-center gap-1 text-sm hover:text-blue-600 cursor-pointer">
            <FontAwesomeIcon icon={faLocationDot} /> Nam Định
          </div>
          <div className="flex items-center gap-1 text-sm hover:text-blue-600 cursor-pointer">
            <FontAwesomeIcon icon={faClock} /> 24H
          </div>

          {/* User dropdown */}
          <div className="relative group cursor-pointer">
            <div className="p-2 hover:text-blue-600">
              <FontAwesomeIcon icon={faUser} /> User Name
            </div>
            <ul className="absolute right-0 mt-2 hidden group-hover:block bg-white rounded-lg shadow-lg z-20 min-w-[200px] border">
              <li>
                <Link
                  to="/admin"
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-100"
                >
                  <FontAwesomeIcon icon={faDashboard} /> Admin dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/user/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-100"
                >
                  <FontAwesomeIcon icon={faUser} /> Tài khoản
                </Link>
              </li>
              <li>
                <Link
                  to="/user/carts"
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-100"
                >
                  <FontAwesomeIcon icon={faCartShopping} /> Giỏ hàng
                </Link>
              </li>
              <li>
                <Link
                  to="/books/history"
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-100"
                >
                  <FontAwesomeIcon icon={faHistory} /> Lịch sử
                </Link>
              </li>
              <li>
                <p className="block px-4 py-2 text-gray-700 hover:bg-blue-100 cursor-pointer">
                  <FontAwesomeIcon icon={faSignOut} /> Đăng xuất
                </p>
              </li>
            </ul>
          </div>

          {/* Nếu chưa login thì show Login */}
          {/* <Link to="/login" className="hover:text-blue-600">
            <FontAwesomeIcon icon={faSignIn} /> Login
          </Link> */}
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-blue-700">
        <ul className="container mx-auto flex gap-6 items-center px-4">
          <li>
            <Link
              to="/"
              className="text-white px-4 py-3 block hover:bg-blue-800 rounded transition"
            >
              Trang chủ
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className="text-white px-4 py-3 block hover:bg-blue-800 rounded transition"
            >
              Giới thiệu
            </Link>
          </li>
          <li>
            <Link
              to="/news"
              className="text-white px-4 py-3 block hover:bg-blue-800 rounded transition"
            >
              Tin tức
            </Link>
          </li>
          <li>
            <Link
              to="/policies"
              className="text-white px-4 py-3 block hover:bg-blue-800 rounded transition"
            >
              Chính sách bảo mật
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Header
