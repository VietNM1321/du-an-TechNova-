import { useState, useEffect, useRef } from "react";
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
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useCart } from "../components/cart";

const Header = ({
  selectedCategory,
  setSelectedCategory,
  selectedAuthor,
  setSelectedAuthor,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [showBooksMenu, setShowBooksMenu] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const navigate = useNavigate();
  const { cart } = useCart();
  const totalItems =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  /* 🟢 Lấy thông tin user từ localStorage */
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  /* 🟢 Lấy danh mục và tác giả */
  useEffect(() => {
    fetch("http://localhost:5000/api/category")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.log(err));

    fetch("http://localhost:5000/api/author")
      .then((res) => res.json())
      .then((data) => setAuthors(data))
      .catch((err) => console.log(err));
  }, []);

  /* 🟢 Đóng menu user khi click ra ngoài */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* 🟢 Đăng xuất */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  /* 🟢 Xử lý tìm kiếm */
  const handleSearch = (e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;
    // điều hướng đến trang kết quả tìm kiếm với query param
    setSearchOpen(false);
    setSearchTerm("");
    setMenuOpen(false);
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white text-gray-800 shadow-sm border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="logo" className="h-10 w-auto" />
        </Link>

        {/* Navigation desktop */}
        <nav className="hidden md:flex gap-8 text-sm font-medium items-center">
          <Link to="/" className="text-gray-700 hover:text-blue-600">
            Trang Chủ
          </Link>
          <Link to="/about" className="text-gray-700 hover:text-blue-600">
            Giới thiệu
          </Link>

          {/* Menu Sách */}
          <div className="relative">
            <button
              onClick={() => setShowBooksMenu(!showBooksMenu)}
              className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
            >
              Danh mục
            </button>
            <AnimatePresence>
              {showBooksMenu && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bg-white shadow-lg rounded-xl mt-2 border border-gray-200 w-56 overflow-hidden z-50"
                >
                  <li>
                    <button
                      onClick={() => {
                        setSelectedCategory("");
                        setSelectedAuthor("");
                        setShowBooksMenu(false);
                      }}
                      className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800 w-full text-left"
                    >
                      Toàn bộ sách
                    </button>
                  </li>
                  <li className="border-t border-gray-200">
                    <p className="px-4 py-2 text-sm font-semibold text-gray-500">
                      Theo danh mục
                    </p>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat._id}>
                      <button
                        onClick={() => {
                          setSelectedCategory(cat.name);
                          setSelectedAuthor("");
                          setShowBooksMenu(false);
                        }}
                        className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800 w-full text-left"
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                  <li className="border-t border-gray-200">
                    <p className="px-4 py-2 text-sm font-semibold text-gray-500">
                      Theo tác giả
                    </p>
                  </li>
                  {authors.map((author) => (
                    <li key={author._id}>
                      <button
                        onClick={() => {
                          setSelectedAuthor(author.name);
                          setSelectedCategory("");
                          setShowBooksMenu(false);
                        }}
                        className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800 w-full text-left"
                      >
                        {author.name}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          <Link to="/news" className="text-gray-700 hover:text-blue-600">
            Tin tức
          </Link>
          <Link to="/policies" className="text-gray-700 hover:text-blue-600">
            Chính sách
          </Link>
          <Link to="/contact" className="text-gray-700 hover:text-blue-600">
            Liên hệ
          </Link>
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
          <Link to="/cart" className="relative text-gray-700 hover:text-blue-600">
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                {totalItems}
              </span>
            )}
          </Link>

          {/* User menu */}
          {user ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                {user.studentCode}
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.ul
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 bg-white text-gray-800 rounded-xl overflow-hidden shadow-xl w-48 border border-gray-100 z-50"
                  >
                    {user.role === "admin" && (
                      <li>
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                        >
                          <LayoutDashboard size={16} /> Quản trị
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link
                        to={`/profile/${user.id}`} // 👈 dùng user.id thay vì undefined
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                      >
                        <User size={16} /> Hồ sơ
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/history"
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
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg"
            >
              Đăng nhập
            </Link>
          )}

          {/* Menu mobile */}
          <button
            className="md:hidden text-gray-700 hover:text-blue-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
