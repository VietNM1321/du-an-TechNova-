import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // dùng để điều hướng

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/auth/login", {
        email,
        password,
      });

      // Lưu token vào localStorage
      localStorage.setItem("token", res.data.token);

      // Thông báo thành công
      setMessage("Đăng nhập thành công!");

      // Chuyển hướng sang trang chủ sau 1s
      setTimeout(() => {
        navigate("/"); // "/" là route trang chủ
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Đăng nhập thất bại!");
    }
  };

  const handleRegisterRedirect = () => {
    navigate("/register"); // chuyển sang trang đăng ký
  };

  return (
    <div className="auth-form">
      <h2>Đăng nhập</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Gmail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button type="submit">Đăng nhập</button>
          <button type="button" onClick={handleRegisterRedirect}>
            Đăng ký
          </button>
        </div>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default Login;
