import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  History,
} from "lucide-react";
import { useState, useEffect } from "react";
import logo from "../assets/logo.png";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const navigate = useNavigate();

  // 🔹 Lấy thông tin sinh viên từ localStorage
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setStudentCode(parsedUser.studentCode);
    }
  }, []);

  // 🔹 Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setStudentCode("");
    navigate("/login");
  };

  // 🔹 Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
     navigate(`/search?q=${encodeURIComponent(searchTerm)}`);

      setSearchOpen(false);
      setSearchTerm("");
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white text-gray-800 shadow-sm border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="logo" className="h-10 w-auto" />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          {[
            { label: "Trang Chủ", path: "/" },
            { label: "Giới thiệu", path: "/about" },
            { label: "Tác giả", path: "/authors" },
            { label: "Tin tức", path: "/news" },
            { label: "Chính sách", path: "/policies" },
            { label: "Liên hệ", path: "/contact" },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-5">
          {/* Search */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              <Search size={20} />
            </motion.button>

            <AnimatePresence>
              {searchOpen && (
                <motion.form
                  onSubmit={handleSearch}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 bg-white border border-gray-200 rounded-full shadow-lg overflow-hidden flex items-center"
                >
                  <input
                    type="text"
                    placeholder="Tìm kiếm sách..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 w-60 outline-none text-sm text-gray-800"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 text-blue-600 hover:text-blue-700"
                  >
                    <Search size={18} />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Cart */}
          <Link
            to="/user/carts"
            className="relative text-gray-700 hover:text-blue-600"
          >
            <ShoppingCart size={22} />
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              3
            </span>
          </Link>

          {/* User menu */}
          {studentCode ? (
            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-600 font-medium">
                {studentCode}
              </button>
              <ul className="absolute right-0 mt-3 hidden group-hover:block bg-white text-gray-800 rounded-xl overflow-hidden shadow-xl w-48 border border-gray-100">
                <li>
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                  >
                    <LayoutDashboard size={16} /> Quản trị
                  </Link>
                </li>
                <li>
                  <Link
                    to="/user/profile"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                  >
                    <User size={16} /> Hồ sơ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/books/history"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                  >
                    <History size={16} /> Lịch sử
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                  >
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Đăng nhập
            </Link>
          )}

          {/* Mobile button */}
          <button
            className="md:hidden text-gray-700 hover:text-blue-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-200 overflow-hidden"
          >
            <ul className="flex flex-col py-2 text-gray-800 text-sm">
              {[
                { label: "Tìm kiếm", path: "/" },
                { label: "Học liệu số", path: "/hoclieu" },
                { label: "Thư viện cá nhân", path: "/thuvien" },
                { label: "Giới thiệu", path: "/about" },
              ].map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className="block px-6 py-3 hover:bg-gray-100"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
