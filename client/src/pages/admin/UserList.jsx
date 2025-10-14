import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/auth/students")
      .then(res => setUsers(res.data))
      .catch(err => console.error("Lỗi khi tải danh sách sinh viên:", err));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Danh sách sinh viên</h2>
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Mã SV</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Trạng thái</th>
            <th className="border px-4 py-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td className="border px-4 py-2">{u.studentCode}</td>
              <td className="border px-4 py-2">{u.email}</td>
              <td className="border px-4 py-2">
                {u.active ? "Đang hoạt động" : "Bị khóa"}
              </td>
              <td className="border px-4 py-2 text-center">
                <Link to={`/admin/set-password/${u._id}`} className="text-blue-600 hover:underline">
                  Cấp mật khẩu
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
