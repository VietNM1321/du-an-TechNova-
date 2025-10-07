import { Outlet, Routes, Route, Link } from "react-router-dom";
import CategoryManager from "../pages/admin/CategoryManager";

function AdminLayout() {
  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <aside style={{ width: "220px", background: "#f8f9fa", padding: "20px" }}>
        <h3>Thủ thư</h3>
        <nav>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li><Link to="/admin/categories"> Danh mục</Link></li>
          </ul>
        </nav>
      </aside>

      {/* Nội dung */}
      <main style={{ flex: 1, padding: "20px" }}>
        <Routes>
          <Route path="categories" element={<CategoryManager />} />
        </Routes>
      </main>
    </div>
  );
}

export default AdminLayout;
