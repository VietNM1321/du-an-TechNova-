import AdminHeader from '../components/AdminHeader'
import AdminFooter from '../components/AdminFooter'
import { Outlet, Link, useLocation } from 'react-router-dom'

const sidebarLinks = [
  { to: '/admin', label: 'Bảng điều khiển', icon: '🏠' },
  { to: '/admin/users', label: 'Quản lý người dùng', icon: '👤' },
  { to: '/admin/products', label: 'Quản lý sản phẩm', icon: '📦' },
  { to: '/admin/orders', label: 'Quản lý đơn hàng', icon: '🧾' },
]

const AdminLayout = () => {
  const location = useLocation()
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <AdminHeader />
      <div className="flex flex-1">
        <aside className="w-64 bg-white shadow-md p-6">
          <nav className="space-y-2">
            {sidebarLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center px-3 py-2 rounded-lg font-medium transition 
                  ${location.pathname === link.to ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
      <AdminFooter />
    </div>
  )
}

export default AdminLayout