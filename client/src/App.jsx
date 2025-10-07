import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLayout from "./layout/AdminLayout";
import ClientLayout from "./layout/ClientLayout";
import CategoryManager from "./pages/admin/CategoryManager";
import BookList from "./pages/BookList"; 



function App() {
  return (
    <Router>
      <Routes>
        {/* Layout cho client */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="books" element={<BookList />} /> {/* 👈 thêm dòng này */}
        </Route>

        {/* Layout cho admin */}
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<h2>Trang quản trị</h2>} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="categories" element={<CategoryManager />} />
         

        </Route>
      </Routes>
    </Router>
  );
}

export default App;
