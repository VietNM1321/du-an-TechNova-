import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, User, Menu, X, LogOut, LayoutDashboard, History } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useCart } from "../components/cart";
const Header = ({ selectedCategory, setSelectedCategory }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const navigate = useNavigate();
  const { cart } = useCart();

  const totalItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setStudentCode(JSON.parse(user).studentCode);
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/category")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.log(err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setStudentCode("");
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSelectedCategory(searchTerm);
      setSearchOpen(false);
      setSearchTerm("");
      navigate("/");
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white text-gray-800 shadow-sm border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="logo" className="h-10 w-auto" />
        </Link>

        {/* Navigation desktop */}
        <nav className="hidden md:flex gap-8 text-sm font-medium items-center">
          <Link to="/" className="text-gray-700 hover:text-blue-600">Trang Chủ</Link>
          <Link to="/about" className="text-gray-700 hover:text-blue-600">Giới thiệu</Link>

          {/* Menu Sách */}
          <div className="relative">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
            >
              Sách
            </button>
            <AnimatePresence>
              {showCategories && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bg-white shadow-lg rounded-xl mt-2 border border-gray-200 w-44 overflow-hidden z-50"
                >
                  <li>
                    <button
                      onClick={() => { setSelectedCategory(""); setShowCategories(false); }}
                      className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800 w-full text-left"
                    >
                      Toàn bộ sách
                    </button>
                  </li>
                  {categories.map(cat => (
                    <li key={cat._id}>
                      <button
                        onClick={() => { setSelectedCategory(cat.name); setShowCategories(false); }}
                        className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800 w-full text-left"
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          <Link to="/news" className="text-gray-700 hover:text-blue-600">Tin tức</Link>
          <Link to="/policies" className="text-gray-700 hover:text-blue-600">Chính sách</Link>
          <Link to="/contact" className="text-gray-700 hover:text-blue-600">Liên hệ</Link>
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-5">
          {/* Search */}
          <div className="relative">
            <motion.button whileHover={{ scale: 1.1 }} onClick={() => setSearchOpen(!searchOpen)} className="text-gray-700 hover:text-blue-600">
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
                  <button type="submit" className="px-3 py-2 text-blue-600 hover:text-blue-700">
                    <Search size={18} />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <Link to="/cart" className="relative text-gray-700 hover:text-blue-600">
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                {totalItems}
              </span>
            )}
          </Link>

          {/* User menu */}
          {studentCode ? (
            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-600 font-medium">{studentCode}</button>
              <ul className="absolute right-0 mt-3 hidden group-hover:block bg-white text-gray-800 rounded-xl overflow-hidden shadow-xl w-48 border border-gray-100">
                <li><Link to="/admin" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"><LayoutDashboard size={16}/> Quản trị</Link></li>
                <li><Link to="/user/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"><User size={16}/> Hồ sơ</Link></li>
                <li><Link to="/books/history" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"><History size={16}/> Lịch sử</Link></li>
                <li><button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-gray-100"><LogOut size={16}/> Đăng xuất</button></li>
              </ul>
            </div>
          ) : (
            <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg">Đăng nhập</Link>
          )}

          <button className="md:hidden text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
