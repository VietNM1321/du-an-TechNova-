import { useEffect, useState } from "react";
import axios from "axios";
import { Input, Select, Space, Button, Row, Col, Form } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const SetPassword = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [passwords, setPasswords] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingIds, setLoadingIds] = useState([]);
  const [searchForm] = Form.useForm();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("UNAUTHENTICATED");
      const res = await axios.get("http://localhost:5000/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách:", err);
      if (err.response?.status === 401 || err.message === "UNAUTHENTICATED") {
        alert("Bạn cần đăng nhập với quyền Admin để truy cập.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Cập nhật mật khẩu local state khi nhập
  const handlePasswordChange = (id, value) => {
    setPasswords((prev) => ({ ...prev, [id]: value }));
  };

  // Cấp hoặc đổi mật khẩu
  const handleSetPassword = async (id) => {
    const password = passwords[id];
    if (!password) return alert("Vui lòng nhập mật khẩu!");

    setLoadingIds((prev) => [...prev, id]);

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("UNAUTHENTICATED");
      const res = await axios.put(
        `http://localhost:5000/api/auth/setpassword/${id}`,
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message || "✅ Mật khẩu đã được cấp và gửi tới email sinh viên!");

      // Cập nhật trực tiếp state user
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u._id === id ? { ...u, password: true } : u
        )
      );

      // Reset input mật khẩu
      setPasswords((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data?.message) {
        alert(`❌ ${err.response.data.message}`);
      } else {
        const msg =
          err.response?.status === 401 || err.message === "UNAUTHENTICATED"
            ? "Bạn cần đăng nhập với quyền Admin để cấp mật khẩu."
            : "❌ Lỗi khi cấp mật khẩu!";
        alert(msg);
      }
    } finally {
      setLoadingIds((prev) => prev.filter((uid) => uid !== id));
    }
  };

  const handleSearch = (values) => {
    let filtered = [...users];
    
    if (values.searchText) {
      const searchLower = values.searchText.toLowerCase();
      filtered = filtered.filter(user => 
        (user.studentCode && user.studentCode.toLowerCase().includes(searchLower)) ||
        (user.name && user.name.toLowerCase().includes(searchLower)) ||
        (user.email && user.email.toLowerCase().includes(searchLower))
      );
    }

    if (values.passwordStatus) {
      if (values.passwordStatus === 'withPassword') {
        filtered = filtered.filter(user => user.password);
      } else if (values.passwordStatus === 'withoutPassword') {
        filtered = filtered.filter(user => !user.password);
      }
    }

    if (values.courseFilter) {
      filtered = filtered.filter(user => 
        user.course && user.course.toLowerCase() === values.courseFilter.toLowerCase()
      );
    }

    setFilteredUsers(filtered);
  };

  // Lấy danh sách khóa học duy nhất để làm bộ lọc
  const uniqueCourses = [...new Set(users.map(user => user.course).filter(Boolean))];

  if (loading) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-green-600">
        Cấp mật khẩu cho sinh viên
      </h2>

      <Form
        form={searchForm}
        onFinish={handleSearch}
        className="mb-4"
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="searchText">
              <Input
                placeholder="Tìm theo mã SV, họ tên, email"
                prefix={<SearchOutlined />}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="passwordStatus">
              <Select placeholder="Trạng thái mật khẩu" allowClear>
                <Select.Option value="withPassword">Đã có mật khẩu</Select.Option>
                <Select.Option value="withoutPassword">Chưa có mật khẩu</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="courseFilter">
              <Select placeholder="Lọc theo khóa học" allowClear>
                {uniqueCourses.map(course => (
                  <Select.Option key={course} value={course}>{course}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Space>
              <Button type="primary" htmlType="submit">
                🔍 Tìm kiếm
              </Button>
              <Button onClick={() => {
                searchForm.resetFields();
                setFilteredUsers(users);
              }}>
                ↺ Đặt lại
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>

      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-green-100 text-left">
            <th className="px-4 py-2 border">Mã sinh viên</th>
            <th className="px-4 py-2 border">Họ tên</th>
            <th className="px-4 py-2 border">Email</th>
            <th className="px-4 py-2 border">Khóa học</th>
            <th className="px-4 py-2 border">Mật khẩu</th>
            <th className="px-4 py-2 border text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u._id} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{u.studentCode}</td>
              <td className="border px-4 py-2">{u.fullName}</td>
              <td className="border px-4 py-2">{u.email}</td>
              <td className="border px-4 py-2">{u.course}</td>
              <td className="border px-4 py-2 text-center">
                {!u.active ? (
                  <span className="text-red-600 font-medium">Đã khóa</span>
                ) : u.password ? (
                  <span className="text-green-600 font-medium">Đã cấp</span>
                ) : (
                  <input
                    type="password"
                    value={passwords[u._id] || ""}
                    onChange={(e) =>
                      handlePasswordChange(u._id, e.target.value)
                    }
                    placeholder="Nhập mật khẩu..."
                    className="border rounded px-2 py-1 w-full"
                  />
                )}
              </td>
              <td className="border px-4 py-2 text-center">
                <button
                  onClick={() => handleSetPassword(u._id)}
                  disabled={loadingIds.includes(u._id) || !u.active}
                  className={`${
                    u.password
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-green-500 hover:bg-green-600"
                  } text-white px-3 py-1 rounded`}
                >
                  {loadingIds.includes(u._id)
                    ? "Đang xử lý..."
                    : !u.active
                    ? "Không thể cấp"
                    : u.password
                    ? "Đổi mật khẩu"
                    : "Cấp mật khẩu"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SetPassword;
