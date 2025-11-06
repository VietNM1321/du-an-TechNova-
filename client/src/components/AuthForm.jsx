import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./AuthForm.css";

function AuthForm({ mode }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const isLogin = mode === "login";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = `http://localhost:5000/api/auth/${isLogin ? "login" : "register"}`;
    const body = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        if (isLogin) {
          localStorage.setItem("token", data.token);
          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
          }
          window.dispatchEvent(new Event("authChange"));
          alert("Đăng nhập thành công 🎉");
          window.location.replace("/");
        } else {
          alert("Đăng ký thành công 🎉");
          navigate("/login");
        }
      } else {
        alert(data.message || "Thao tác thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi server");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="logo">......</h1>
        <h2>{isLogin ? "Đăng nhập tài khoản" : "Tạo tài khoản mới"}</h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Tên của bạn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
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
          <button type="submit">{isLogin ? "Đăng nhập" : "Đăng ký"}</button>
        </form>

        <p>
          {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
          <Link to={isLogin ? "/register" : "/login"}>
            {isLogin ? "Đăng ký ngay" : "Đăng nhập ngay"}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AuthForm;
