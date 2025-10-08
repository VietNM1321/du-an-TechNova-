import { Outlet, Link, useLocation } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";

const sidebarLinks = [
  { to: "/admin", label: "Bảng điều khiển", icon: "🏠" },
  { to: "/admin/categories", label: "Quản lý danh mục", icon: "📚" },
  { to: "/admin/users", label: "Quản lý người dùng", icon: "👤" },
  { to: "/admin/products", label: "Quản lý sản phẩm", icon: "📦" },
  { to: "/admin/orders", label: "Quản lý đơn hàng", icon: "🧾" },
];

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <AdminHeader />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Thủ thư</h3>
          <nav className="space-y-2">
            {sidebarLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center px-3 py-2 rounded-lg font-medium transition 
                  ${
                    location.pathname === link.to
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-blue-100"
                  }`}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Nội dung chính */}
        <main className="flex-1 p-8 bg-gray-50 rounded-lg shadow-inner">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <AdminFooter />
    </div>
  );
};

export default AdminLayout;
