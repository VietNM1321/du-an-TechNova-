import { motion } from "framer-motion";
import { LogOut, LayoutDashboard } from "lucide-react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const AdminHeader = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Người dùng");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const storedUser = localStorage.getItem("adminUser");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.role === "admin" || user.role === "librarian") {
          setUserName(user.email?.split("@")[0] || (user.role === "admin" ? "Admin" : "Thủ thư"));
          setUserRole(user.role);
        }
      } catch (err) {
        console.error("Lỗi khi đọc thông tin user:", err);
      }
    }
  }, []);

  const handleLogout = () => {
    // Xóa tất cả token và user info
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("clientToken");
    localStorage.removeItem("clientUser");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Dispatch event để các component khác biết đã logout
    window.dispatchEvent(new Event("authChange"));
    window.dispatchEvent(new Event("storage"));

    // Force reload để reset state
    window.location.href = "/login";
  };

  // Đặt tiêu đề hiển thị theo role
  const roleTitle = userRole === "admin" ? "Admin" : userRole === "librarian" ? "Thủ thư" : "";

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="flex justify-between items-center px-6 py-3">
        {/* Logo + tên user */}
        <div className="flex items-center gap-3">
          <motion.img
            src={logo}
            alt="LiNova Logo"
            className="h-10 w-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />
          <h1 className="text-xl font-semibold text-blue-600 tracking-wide flex items-center gap-2">
            <LayoutDashboard size={20} className="text-blue-500" />
            {roleTitle}
          </h1>
        </div>

        {/* Thông tin user + nút đăng xuất */}
        <div className="flex items-center gap-5">
          <span className="text-gray-700 font-medium">
            Xin chào, {userName} 👋
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
