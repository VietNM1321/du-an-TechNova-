import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import ImportList from "./pages/admin/ImportList";
import ImportAdd from "./pages/admin/ImportAdd";
import AdminLayout from "./layout/adminLayout";
import AdminHome from "./pages/admin/AdminHome";
import BookManager from "./pages/admin/Bookmanager";
import BorrowManager from "./pages/admin/BorrowManager";
import AuthorManager from "./pages/admin/AuthorManager";
import BookEdit from "./pages/admin/BookEdit";
import BookCode from "./pages/admin/BookCode";
import BookCodeAdd from "./pages/admin/BookCodeAdd";
import BookCodeEdit from "./pages/admin/BookCodeEdit";
import AuthorAdd from "./pages/admin/AuthorAdd";
import BookAdd from "./pages/admin/BookAdd";
import AuthorEdit from "./pages/admin/AuthorEdit";
import Bookdetails from "./pages/admin/Bookdetail";
import CategoryManager from "./pages/admin/CategoryManager";
import AddCategory from "./pages/admin/Addcategory";
import EditCategory from "./pages/admin/Editcategory";
import SetPassword from "./pages/admin/SetPassword";
import Users from "./pages/admin/Users";
import History from "./pages/History";
import ClientLayout from "./layout/clientlayout";
import CourseManager from "./pages/admin/CourseManager";
import ReviewManager from "./pages/admin/ReviewManager";
import ChangePassword from "./pages/ChangePassword"
import NotificationList from "./pages/admin/NotificationList";
import AddNotification from "./pages/admin/AddNotification";
import EditNotification from "./pages/admin/EditNotification";
import NotificationDetail from "./pages/NotificationDetail"; 



const AdminRoute = ({ children }) => {
  const stored = localStorage.getItem("adminUser");
  const adminUser = stored ? JSON.parse(stored) : null;
  const adminToken = localStorage.getItem("adminToken");
  if (!adminToken || !adminUser || adminUser.role !== "admin") {
    return <Navigate to="/login" replace />;
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
          <Route path="/history" element={<History />} />
          <Route path="/changepassword" element={<ChangePassword />} />
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
          <Route path="bookmanager" element={<BookManager />} />
          <Route path="bookadd" element={<BookAdd />} />
          <Route path="book/edit/:id" element={<BookEdit />} />
          <Route path="bookcode" element={<BookCode />} />
          <Route path="bookcode/add" element={<BookCodeAdd />} />
          <Route path="book/detail/:id" element={<Bookdetails />} />
          <Route path="bookcode/edit/:id" element={<BookCodeEdit />} />
          <Route path="importlist" element={<ImportList />} />
          <Route path="importlist/add" element={<ImportAdd />} />
          <Route path="author" element={<AuthorManager />} />
          <Route path="borrowings" element={<BorrowManager />} />
          <Route path="author/add" element={<AuthorAdd />} />
          <Route path="authoredit/:id" element={<AuthorEdit />} />
          <Route path="category" element={<CategoryManager />} />
          <Route path="category/add" element={<AddCategory />} />
          <Route path="category/edit/:id" element={<EditCategory />} />
          <Route path="setpassword" element={<SetPassword />} />
          <Route path="users" element={<Users />} />
          <Route path="course" element={<CourseManager />} />
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
