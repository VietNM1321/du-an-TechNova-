import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
          alert("Đăng nhập thành công 🎉");
          navigate("/");
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* Ô vuông trắng */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">
          TECHNOVA
        </h1>
        <h2 className="text-xl font-semibold mb-4 text-center">
          {isLogin ? "Đăng nhập" : "Đăng ký"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Tên của bạn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          )}
          <input
            type="email"
            placeholder="Gmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
          >
            {isLogin ? "Đăng nhập" : "Đăng ký"}
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-500">
          {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
          <a
            href={isLogin ? "/register" : "/login"}
            className="text-blue-600 hover:underline"
          >
            {isLogin ? "Đăng ký" : "Đăng nhập"}
          </a>
        </p>
      </div>
    </div>
  );
}

export default AuthForm;
