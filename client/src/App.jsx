import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ClientLayout from "./layout/clientlayout";
import AdminLayout from "./layout/adminLayout";

// Client pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import BookList from "./pages/BookList";
import BookDetail from "./pages/bookdetail";
import SearchResults from "./pages/SearchResults";
import Cart from "./pages/Cart";
import About from "./pages/About";
import News from "./pages/News";
import Contact from "./pages/Contact";
import Policies from "./pages/Policies";
import History from "./pages/History";
import Payment from "./pages/Payment";
import ChangePassword from "./pages/ChangePassword";
import ForgotPassword from "./pages/ForgotPassword";

// AI Chat page
import Chat from "./pages/Chat";

// Admin pages
import AdminHome from "./pages/admin/AdminHome";
import Users from "./pages/admin/Users";
import SetPassword from "./pages/admin/SetPassword";
import CourseManager from "./pages/admin/CourseManager";
import BookManager from "./pages/admin/Bookmanager";
import BookAdd from "./pages/admin/BookAdd";
import BookEdit from "./pages/admin/BookEdit";
import BookCode from "./pages/admin/BookCode";
import BookCodeAdd from "./pages/admin/BookCodeAdd";
import BookCodeEdit from "./pages/admin/BookCodeEdit";
import ImportList from "./pages/admin/ImportList";
import ImportAdd from "./pages/admin/ImportAdd";
import AuthorManager from "./pages/admin/AuthorManager";
import AuthorAdd from "./pages/admin/AuthorAdd";
import AuthorEdit from "./pages/admin/AuthorEdit";
import BorrowManager from "./pages/admin/BorrowManager";
import CategoryManager from "./pages/admin/CategoryManager";
import AddCategory from "./pages/admin/Addcategory";
import EditCategory from "./pages/admin/Editcategory";
import ReviewManager from "./pages/admin/ReviewManager";
import NotificationList from "./pages/admin/NotificationList";
import AddNotification from "./pages/admin/AddNotification";
import EditNotification from "./pages/admin/EditNotification";
import NotificationDetail from "./components/NotificationDetail";

// -------- ROUTE GUARDS --------
const AdminRoute = ({ children }) => {
  const stored = localStorage.getItem("adminUser");
  const adminUser = stored ? JSON.parse(stored) : null;

  if (!adminUser || !(adminUser.role === "admin" || adminUser.role === "librarian")) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminOnly = ({ children }) => {
  const stored = localStorage.getItem("adminUser");
  const adminUser = stored ? JSON.parse(stored) : null;

  if (!adminUser || adminUser.role !== "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Client routes */}
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
          <Route path="history" element={<History />} />
          <Route path="payment/:id" element={<Payment />} />
          <Route path="changepassword" element={<ChangePassword />} />
          <Route path="forgot-password" element={<ForgotPassword />} />

          {/* 💬 Thêm route Chat AI */}
          <Route path="chat" element={<Chat />} />
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminHome />} />

          {/* Admin-only pages */}
          <Route path="users" element={<AdminOnly><Users /></AdminOnly>} />
          <Route path="setpassword" element={<AdminOnly><SetPassword /></AdminOnly>} />
          <Route path="course" element={<AdminOnly><CourseManager /></AdminOnly>} />

          {/* Admin + Librarian pages */}
          <Route path="bookmanager" element={<BookManager />} />
          <Route path="bookadd" element={<BookAdd />} />
          <Route path="book/edit/:id" element={<BookEdit />} />
          <Route path="bookcode" element={<BookCode />} />
          <Route path="bookcode/add" element={<BookCodeAdd />} />
          <Route path="bookcode/edit/:id" element={<BookCodeEdit />} />
          <Route path="importlist" element={<ImportList />} />
          <Route path="importlist/add" element={<ImportAdd />} />
          <Route path="author" element={<AuthorManager />} />
          <Route path="author/add" element={<AuthorAdd />} />
          <Route path="authoredit/:id" element={<AuthorEdit />} />
          <Route path="borrowings" element={<BorrowManager />} />
          <Route path="category" element={<CategoryManager />} />
          <Route path="category/add" element={<AddCategory />} />
          <Route path="category/edit/:id" element={<EditCategory />} />
          <Route path="reviews" element={<ReviewManager />} />
          <Route path="notifications" element={<NotificationList />} />
          <Route path="notifications/add" element={<AddNotification />} />
          <Route path="notifications/edit/:id" element={<EditNotification />} />
          <Route path="notification/:id" element={<NotificationDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
