import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import News from "./pages/News";
import Contact from "./pages/Contact";
import Policies from "./pages/Policies";
import BookList from "./pages/BookList";
import ForgotPassword from "./pages/ForgotPassword";

// Admin pages
import AdminLayout from "./layout/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import CategoryManager from "./pages/admin/CategoryManager";
import UserList from "./pages/admin/UserList";
import SetPassword from "./pages/admin/SetPassword";

// Layouts
import ClientLayout from "./layout/ClientLayout";

function App() {
  return (
    <Router>
      <Routes>
        {/* Layout cho client */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="books" element={<BookList />} />
          <Route path="about" element={<About />} />
          <Route path="news" element={<News />} />
          <Route path="contact" element={<Contact />} />
          <Route path="policies" element={<Policies />} />
        </Route>

        {/* Layout cho admin */}
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="users" element={<UserList />} />
          <Route path="setpassword" element={<SetPassword />} />

        </Route>
      </Routes>
    </Router>
  );
}

export default App;
