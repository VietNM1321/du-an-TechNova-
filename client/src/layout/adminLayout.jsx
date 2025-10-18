import { Outlet, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Package,
  Users,
  FileText,
  PenTool,
  KeyRound,
  LogOut,
} from "lucide-react";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";

const sidebarLinks = [
  { to: "/admin", label: "Bảng điều khiển", icon: <LayoutDashboard size={18} /> },
  { to: "/admin/category", label: "Quản lý danh mục", icon: <BookOpen size={18} /> },
  { to: "/admin/bookManager", label: "Quản lý sách", icon: <Package size={18} /> },
  { to: "/admin/author", label: "Quản lý tác giả", icon: <PenTool size={18} /> },
  { to: "/admin/users", label: "Quản lý người dùng", icon: <Users size={18} /> },
  { to: "/admin/orders", label: "Quản lý đơn hàng", icon: <FileText size={18} /> },

  // 🆕 Thêm mục Cấp mật khẩu
  { to: "/admin/setpassword", label: "Cấp mật khẩu", icon: <KeyRound size={18} /> },
];

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <AdminHeader />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-xl border-r border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-blue-600 tracking-wide">
              📘 Quản trị viên
            </h3>
          </div>

          <nav className="mt-4 space-y-2 px-4">
            {sidebarLinks.map((link) => (
              <motion.div
                key={link.to}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Link
                  to={link.to}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    location.pathname === link.to
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              </motion.div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 bg-gray-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <AdminFooter />
    </div>
  );
};

export default AdminLayout;
