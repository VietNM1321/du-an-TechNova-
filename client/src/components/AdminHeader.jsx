import { motion } from "framer-motion";
import { LogOut, LayoutDashboard } from "lucide-react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const AdminHeader = () => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const storedUser = localStorage.getItem("adminUser");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.role === "admin") {
          setAdminName(user.email?.split("@")[0] || "Admin");
        }
      } catch (err) {
        console.error("Lỗi khi đọc thông tin user:", err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login"); // Điều hướng về trang đăng nhập
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="flex justify-between items-center px-6 py-3">
        {/* Logo + tên admin */}
        <div className="flex items-center gap-3">
          <motion.img
            src={logo}
            alt="LiNova Admin Logo"
            className="h-10 w-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />
          <h1 className="text-xl font-semibold text-blue-600 tracking-wide flex items-center gap-2">
            <LayoutDashboard size={20} className="text-blue-500" />
          Thủ thư
          </h1>
        </div>

        {/* Thông tin admin + nút đăng xuất */}
        <div className="flex items-center gap-5">
          <span className="text-gray-700 font-medium">
            Xin chào, {adminName} 👋
          </span>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all"
          >
            <LogOut size={18} />
            Đăng xuất
          </motion.button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
