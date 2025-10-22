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
import SearchResults from "./pages/SearchResults";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";

import AdminLayout from "./layout/adminLayout";
import AdminHome from "./pages/admin/AdminHome";
import BookManager from "./pages/admin/Bookmanager";
import AuthorManager from "./pages/admin/AuthorManager";
import AuthorAdd from "./pages/admin/AuthorAdd";
import AuthorEdit from "./pages/admin/AuthorEdit";
import CategoryManager from "./pages/admin/CategoryManager";
import SetPassword from "./pages/admin/SetPassword";
import Users from "./pages/admin/Users";
import ClientLayout from "./layout/ClientLayout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="books" element={<BookList />} />
          <Route path="book/:id" element={<BookDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="about" element={<About />} />
          <Route path="news" element={<News />} />
          <Route path="contact" element={<Contact />} />
          <Route path="policies" element={<Policies />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="profile/:id" element={<Profile />} />
        </Route>
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="bookmanager" element={<BookManager />} />
          <Route path="author" element={<AuthorManager />} />
          <Route path="authoradd" element={<AuthorAdd />} />
          <Route path="authoredit/:id" element={<AuthorEdit />} />
          <Route path="category" element={<CategoryManager />} />
          <Route path="setpassword" element={<SetPassword />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
