const AdminHome = () => (
  <div>
    <h2 className="text-3xl font-bold mb-6 text-blue-700">
      Bảng điều khiển quản trị
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-4xl mb-2">👤</span>
        <div className="text-lg font-semibold">Người dùng</div>
        <div className="text-2xl font-bold text-blue-700">123</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-4xl mb-2">📦</span>
        <div className="text-lg font-semibold">Sản phẩm</div>
        <div className="text-2xl font-bold text-blue-700">45</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-4xl mb-2">🧾</span>
        <div className="text-lg font-semibold">Đơn hàng</div>
        <div className="text-2xl font-bold text-blue-700">67</div>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">Hoạt động gần đây</h3>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Admin vừa thêm sản phẩm mới.</li>
        <li>Người dùng A vừa đăng ký tài khoản.</li>
        <li>Đơn hàng #1234 vừa được xác nhận.</li>
      </ul>
    </div>
  </div>
);

export default AdminHome;
