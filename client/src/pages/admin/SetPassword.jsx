import React, { useEffect, useState } from "react";
import axios from "axios";
import { Input, Select, Space, Button, Row, Col, Form, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const SetPassword = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [passwords, setPasswords] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingIds, setLoadingIds] = useState([]);
  const [searchForm] = Form.useForm();

  // Lấy danh sách sinh viên
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
      console.error(err);
      message.error("❌ Lỗi khi tải danh sách sinh viên!");
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

  // Cấp mật khẩu
  const handleSetPassword = async (id) => {
    const password = passwords[id];
    if (!password) return message.warning("Vui lòng nhập mật khẩu!");

    setLoadingIds((prev) => [...prev, id]);

    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.put(
        `http://localhost:5000/api/auth/setpassword/${id}`,
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success(res.data.message || "✅ Mật khẩu đã cấp thành công!");

      // cập nhật trạng thái user
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, password: true } : u))
      );
      setPasswords((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "❌ Lỗi khi cấp mật khẩu!");
    } finally {
      setLoadingIds((prev) => prev.filter((uid) => uid !== id));
    }
  };

  // Reset mật khẩu
  const handleResetPassword = async (id) => {
    setLoadingIds((prev) => [...prev, id]);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.put(
        `http://localhost:5000/api/auth/resetpassword/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success(res.data.message || "✅ Mật khẩu đã reset!");
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, password: false } : u))
      );
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "❌ Lỗi khi reset mật khẩu!");
    } finally {
      setLoadingIds((prev) => prev.filter((uid) => uid !== id));
    }
  };

  // Tìm kiếm & lọc
  const handleSearch = (values) => {
    let filtered = [...users];
    if (values.searchText) {
      const searchLower = values.searchText.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          (u.studentCode && u.studentCode.toLowerCase().includes(searchLower)) ||
          (u.fullName && u.fullName.toLowerCase().includes(searchLower)) ||
          (u.email && u.email.toLowerCase().includes(searchLower))
      );
    }
    if (values.passwordStatus) {
      filtered = filtered.filter((u) =>
        values.passwordStatus === "withPassword" ? u.password : !u.password
      );
    }
    if (values.courseFilter) {
      filtered = filtered.filter(
        (u) =>
          u.course &&
          u.course.toLowerCase() === values.courseFilter.toLowerCase()
      );
    }
    setFilteredUsers(filtered);
  };

  const uniqueCourses = [...new Set(users.map((u) => u.course).filter(Boolean))];

  if (loading) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-green-600">
        Cấp / Reset mật khẩu sinh viên
      </h2>

      <Form form={searchForm} onFinish={handleSearch} className="mb-4">
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
                {uniqueCourses.map((course) => (
                  <Select.Option key={course} value={course}>
                    {course}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Space>
              <Button type="primary" htmlType="submit">
                🔍 Tìm kiếm
              </Button>
              <Button
                onClick={() => {
                  searchForm.resetFields();
                  setFilteredUsers(users);
                }}
              >
                ↺ Đặt lại
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-green-100 text-left">
              <th className="px-4 py-2 border">Mã SV</th>
              <th className="px-4 py-2 border">Họ tên</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Khóa học</th>
              <th className="px-4 py-2 border text-center">Mật khẩu</th>
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
                    <Input
                      type="password"
                      value={passwords[u._id] || ""}
                      onChange={(e) => handlePasswordChange(u._id, e.target.value)}
                      placeholder="Nhập mật khẩu..."
                      className="w-full"
                    />
                  )}
                </td>
                <td className="border px-4 py-2 text-center space-x-2">
                  {u.active && !u.password && (
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => handleSetPassword(u._id)}
                      loading={loadingIds.includes(u._id)}
                    >
                      Cấp mật khẩu
                    </Button>
                  )}
                  {u.active && u.password && (
                    <Button
                      type="default"
                      size="small"
                      danger
                      onClick={() => handleResetPassword(u._id)}
                      loading={loadingIds.includes(u._id)}
                    >
                      Reset mật khẩu
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SetPassword;
