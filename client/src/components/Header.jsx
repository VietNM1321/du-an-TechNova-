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
  Bell,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import axios from "axios";
import NotificationDetail from "./NotificationDetail";

const Header = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  const userMenuRef = useRef(null);
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  // Lấy user từ localStorage khi load trang
  useEffect(() => {
    const storedAdmin = localStorage.getItem("adminUser");
    const storedClient = localStorage.getItem("clientUser");
    if (storedAdmin) setUser(JSON.parse(storedAdmin));
    else if (storedClient) setUser(JSON.parse(storedClient));
  }, []);

  // Đồng bộ khi storage thay đổi
  useEffect(() => {
    const handleAuthChange = () => {
      const storedAdmin = localStorage.getItem("adminUser");
      const storedClient = localStorage.getItem("clientUser");
      if (storedAdmin) setUser(JSON.parse(storedAdmin));
      else if (storedClient) setUser(JSON.parse(storedClient));
      else setUser(null);
    };
    window.addEventListener("authChange", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("authChange", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  // Click ngoài menu để đóng
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/notifications");
        setNotifications(res.data || []);
      } catch (err) {
        console.error("Lỗi load notifications:", err);
      }
    };
    fetchNotifications();
  }, []);

  const totalItems = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleLogout = () => {
    localStorage.removeItem("clientUser");
    localStorage.removeItem("clientToken");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setUser(null);
    setCartItems([]);
    window.dispatchEvent(new Event("authChange"));
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    setSearchTerm("");
  };

  const isAdminOrLibrarian = user && (user.role === "admin" || user.role === "librarian");

  const displayRoleName = () => {
    if (!user) return "Tài khoản";
    if (user.role === "admin") return "Admin";
    if (user.role === "librarian") return "Thủ thư";
    return user.fullName || user.name || user.email || "Tài khoản";
  };

  return (
    <header className="w-full bg-white shadow-md border-b border-gray-200 font-sans">
      {/* Top hotline */}
      <div className="bg-red-600 text-white text-sm py-1">
        <marquee behavior="scroll" direction="left" scrollamount="6">
          📞 Hotline: 0938 424 289
        </marquee>
      </div>

      <div className="flex items-center justify-between px-4 md:px-6 py-3 gap-4 flex-wrap">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img src={logo} alt="logo" className="h-12 w-auto" />
          <h1 className="text-lg font-semibold text-gray-800">Trường học</h1>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex flex-1 border border-gray-300 rounded-full items-center px-4 py-2 max-w-xl">
          <Search className="text-gray-500 mr-2" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="flex-1 outline-none text-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-full ml-2 transition">
            Tìm
          </button>
        </form>

        {/* Notification, Cart, User */}
        <div className="flex items-center gap-4 relative">
          <div ref={notifRef} className="relative">
            <button onClick={() => setNotifOpen(prev => !prev)} className="text-gray-700 hover:text-red-700 transition relative">
              <Bell size={24} />
              {notifications.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {notifications.length}
                </span>
              )}
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-3 z-50 w-full max-w-md">
                  <NotificationDetail show={notifOpen} onClose={() => setNotifOpen(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/cart" className="relative text-gray-700 hover:text-red-700 transition">
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <div ref={userMenuRef} className="relative">
              <button onClick={() => setUserMenuOpen(prev => !prev)} className="text-gray-700 hover:text-red-700 font-medium flex items-center gap-1">
                {displayRoleName()}
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.ul initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-3 bg-white text-gray-800 rounded-xl overflow-hidden shadow-xl w-48 border border-gray-100 z-50">
                    {isAdminOrLibrarian && (
                      <li>
                        <Link to="/admin" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                          <LayoutDashboard size={16} /> Quản trị
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link to={`/profile/${user.id}`} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                        <User size={16} /> Hồ sơ
                      </Link>
                    </li>
                    <li>
                      <Link to="/history" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                        <History size={16} /> Lịch sử
                      </Link>
                    </li>
                    <li>
                      <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                        <LogOut size={16} /> Đăng xuất
                      </button>
                    </li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>

      {/* Menu danh mục */}
      <nav className="relative flex items-center bg-gray-100 py-3 px-4 md:px-6 text-gray-800 font-medium border-t border-gray-200 flex-wrap">
        <div ref={menuRef} className="relative">
          <button onClick={() => setMenuOpen(prev => !prev)} className="flex items-center gap-2 text-red-600 font-semibold hover:opacity-80 transition">
            <Menu size={22} /> <span>Danh mục</span>
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute left-0 mt-3 bg-white shadow-xl border border-gray-200 rounded-lg z-50 w-64">
                <p className="p-4 text-gray-500">Danh mục sẽ được hiển thị ở đây</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-6 ml-8 flex-wrap">
          <Link to="/" className="hover:text-red-600 transition">Trang chủ</Link>
          <Link to="/news" className="hover:text-red-600 transition">Tin tức</Link>
          <Link to="/policies" className="hover:text-red-600 transition">Chính sách</Link>
          <Link to="/contact" className="hover:text-red-600 transition">Liên hệ</Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
