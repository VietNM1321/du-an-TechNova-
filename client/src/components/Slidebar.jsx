import { Link } from 'react-router-dom'

const SidebarAdmin = () => {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-4 text-xl font-bold border-b border-gray-700">Admin Panel</div>
      <nav className="flex-1 p-4 flex flex-col gap-3">
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/books">Quản lý Sách</Link>
        <Link to="/admin/users">Quản lý Người dùng</Link>
        <Link to="/admin/borrowings">Quản lý Đơn Mượn</Link>
        <Link to="/admin/fund">Quỹ thư viện</Link>
      </nav>
    </aside>
  )
}

export default SidebarAdmin
