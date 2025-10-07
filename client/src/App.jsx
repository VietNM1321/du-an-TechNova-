import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLayout from "./layout/AdminLayout";
import ClientLayout from "./layout/ClientLayout";
import AdminHome from "./pages/AdminHome";

function App() {
  return (
    <Router>
      <Routes>
        {/* Layout cho client */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* Layout cho admin */}
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
