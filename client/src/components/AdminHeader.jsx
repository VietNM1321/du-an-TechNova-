const AdminHeader = () => (
  <header className="bg-blue-700 text-white shadow">
    <div className="container mx-auto flex justify-between items-center py-4 px-6">
      <h1 className="text-2xl font-bold tracking-wide">LiNova Admin</h1>
      <div>
        <span className="mr-4">Xin chào, Admin</span>
        <button className="bg-blue-900 px-3 py-1 rounded hover:bg-blue-800 transition">Đăng xuất</button>
      </div>
    </div>
  </header>
)

export default AdminHeader