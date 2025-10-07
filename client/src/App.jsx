import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import About from "./pages/About";
import News from "./pages/News";
import Contact from "./pages/Contact";
import Policies from "./pages/Policies";
import Register from "./pages/Register";
import AdminLayout from "./layout/AdminLayout";
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
          <Route path="/about" element={<About />} />
          <Route path="/news" element={<News />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/policies" element={<Policies />} />
        </Route>

        {/* Layout cho admin (nếu có) */}
        <Route path="/admin/*" element={<AdminLayout />} />
      </Routes>
    </Router>
  );
}

export default App;
