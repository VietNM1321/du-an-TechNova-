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
import BookEdit from "./pages/admin/BookEdit"
import BookCode from "./pages/admin/BookCode"
import BookCodeAdd from "./pages/admin/BookcodeAdd";
import BookCodeEdit from "./pages/admin/BookCodeEdit";
import AuthorAdd from "./pages/admin/AuthorAdd";
import BookAdd from "./pages/admin/BookAdd"
import AuthorEdit from "./pages/admin/AuthorEdit";
import CategoryManager from "./pages/admin/CategoryManager";
import AddCategory from "./pages/admin/Addcategory";
import EditCategory from "./pages/admin/Editcategory";
import SetPassword from "./pages/admin/SetPassword";
import Users from "./pages/admin/Users";
import History from "./pages/History";
import ClientLayout from "./layout/ClientLayout";

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
        </Route>

        {/* Admin routes */}
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="bookmanager" element={<BookManager />} />
          <Route path="bookadd" element={<BookAdd />} />
          <Route path="book/edit/:id" element={<BookEdit />} />
          <Route path="bookcode" element={<BookCode />} />
          <Route path="bookcodeadd" element={<BookCodeAdd />} />
          <Route path="bookcode/edit/:id" element={<BookCodeEdit />} />
          <Route path="author" element={<AuthorManager />} />
          <Route path="authoradd" element={<AuthorAdd />} />
          <Route path="authoredit/:id" element={<AuthorEdit />} />
          <Route path="category" element={<CategoryManager />} />
          <Route path="category/add" element={<AddCategory />} />
          <Route path="category/edit/:id" element={<EditCategory />} />
          <Route path="setpassword" element={<SetPassword />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;