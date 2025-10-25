import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  LogOut,
  LayoutDashboard,
  History,
  BookOpen,
  PenTool,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useCart } from "../components/cart";
import axios from "axios";

const Header = ({
  selectedCategory,
  setSelectedCategory,
  selectedAuthor,
  setSelectedAuthor,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const userMenuRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { cart } = useCart();

  const totalItems =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // 🟢 Lấy user từ localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // 🟢 Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🟢 Gọi API danh mục & tác giả
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, authRes] = await Promise.all([
          axios.get("http://localhost:5000/api/category"),
          axios.get("http://localhost:5000/api/authors"),
        ]);
        setCategories(catRes.data);
        setAuthors(authRes.data);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
      }
    };
    fetchData();
  }, []);

  // 🟢 Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  // 🟢 Tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;
    navigate(`/search?q=${encodeURIComponent(term)}`);
    setSearchTerm("");
  };

  // 🟢 Chọn danh mục hoặc tác giả
  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setSelectedAuthor(null);
    navigate(`/category/${category._id}`);
    setMenuOpen(false);
  };

  const handleSelectAuthor = (author) => {
    setSelectedAuthor(author);
    setSelectedCategory(null);
    navigate(`/author/${author._id}`);
    setMenuOpen(false);
  };

  return (
    <header className="w-full bg-white shadow-md border-b border-gray-200 font-sans">
      {/* 🔹 Dòng hotline chạy ngang */}
      <div className="bg-red-600 text-white text-sm py-1">
        <marquee behavior="scroll" direction="left" scrollamount="6">
          📞 Hotline: 0938 424 289
        </marquee>
      </div>

      {/* 🔹 Logo + Tìm kiếm + Giỏ hàng + User */}
      <div className="flex items-center justify-between px-6 py-3 space-x-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="logo" className="h-12 w-auto" />
          <h1 className="text-lg font-semibold text-gray-800">Trường học</h1>
        </Link>

        {/* Ô tìm kiếm */}
        <form
          onSubmit={handleSearch}
          className="flex flex-1 max-w-xl border border-gray-300 rounded-full items-center px-4 py-2"
        >
          <Search className="text-gray-500 mr-2" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="flex-1 outline-none text-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-full ml-2 transition"
          >
            Tìm
          </button>
        </form>

        {/* Giỏ hàng + User */}
        <div className="flex items-center gap-5">
          {/* 🛒 Giỏ hàng */}
          <Link
            to="/cart"
            className="relative text-gray-700 hover:text-red-700 transition"
          >
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                {totalItems}
              </span>
            )}
          </Link>

          {/* 👤 Người dùng */}
          {user ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="text-gray-700 hover:text-red-700 font-medium"
              >
                {user.role === "admin" ? "Admin" : user.fullName}
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.ul
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
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
                        to={`/profile/${user.id}`}
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
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>

      {/* 🔹 Thanh menu Danh mục + Trang chủ + Tin tức + Chính sách + Liên hệ */}
      <nav className="relative flex items-center bg-gray-100 py-3 px-6 text-gray-800 font-medium border-t border-gray-200">
        {/* Danh mục bên trái */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 text-red-600 font-semibold hover:opacity-80 transition"
          >
            <Menu size={22} />
            <span>Danh mục</span>
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-0 mt-3 bg-white shadow-xl border border-gray-200 rounded-lg z-50 grid grid-cols-1 divide-y divide-gray-200"
              >
                {/* Danh mục sách */}
                <div className="p-3">
                  <h3 className="font-semibold text-red-600 flex items-center gap-2 mb-2">
                    <BookOpen size={18} /> Danh mục sách
                  </h3>
                  <ul>
                    {categories.map((cat) => (
                      <li
                        key={cat._id}
                        className="px-3 py-1 hover:bg-gray-100 cursor-pointer rounded-md"
                        onClick={() => handleSelectCategory(cat)}
                      >
                        {cat.name}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Danh mục tác giả */}
                <div className="p-3">
                  <h3 className="font-semibold text-red-600 flex items-center gap-2 mb-2">
                    <PenTool size={18} /> Danh mục tác giả
                  </h3>
                  <ul>
                    {authors.map((author) => (
                      <li
                        key={author._id}
                        className="px-3 py-1 hover:bg-gray-100 cursor-pointer rounded-md"
                        onClick={() => handleSelectAuthor(author)}
                      >
                        {author.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Các mục menu bên cạnh */}
        <div className="flex items-center gap-6 ml-8">
          <Link to="/" className="hover:text-red-600 transition">
            Trang chủ
          </Link>
          <Link to="/news" className="hover:text-red-600 transition">
            Tin tức
          </Link>
          <Link to="/policies" className="hover:text-red-600 transition">
            Chính sách
          </Link>
          <Link to="/contact" className="hover:text-red-600 transition">
            Liên hệ
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
