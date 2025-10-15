import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import News from "./pages/News";
import Contact from "./pages/Contact";
import Policies from "./pages/Policies";
import BookList from "./pages/BookList";
import BookDetail from "./pages/bookdetail";

// Admin pages
import AdminLayout from "./layout/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import BookManager from "./pages/admin/Bookmanager";
import AuthorManager from "./pages/admin/AuthorManager";
import CategoryManager from "./pages/admin/CategoryManager";

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
          <Route path="books" element={<BookList />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="about" element={<About />} />
          <Route path="news" element={<News />} />
          <Route path="contact" element={<Contact />} />
          <Route path="policies" element={<Policies />} />
        </Route>

        {/* Layout cho admin */}
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="bookmanager" element={<BookManager />} />
          <Route path="author" element={<AuthorManager />} />
          <Route path="category" element={<CategoryManager />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
