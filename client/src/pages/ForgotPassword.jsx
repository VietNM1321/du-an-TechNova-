import React, { useState } from "react";
import axios from "axios";

const ForgotPassword = () => {
  const [studentCode, setStudentCode] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", {
        studentCode,
        email,
        newPassword,
      });
      setMessage(res.data.message);
      setStudentCode("");
      setEmail("");
      setNewPassword("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Yêu cầu cấp lại mật khẩu thất bại!");
    }
  };

  return (
    <div className="auth-form">
      <h2>Xin cấp lại mật khẩu</h2>
      <form onSubmit={handleResetPassword}>
        <input
          type="text"
          placeholder="Mã sinh viên"
          value={studentCode}
          onChange={(e) => setStudentCode(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Gmail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button type="submit">Cấp lại mật khẩu</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ForgotPassword;
