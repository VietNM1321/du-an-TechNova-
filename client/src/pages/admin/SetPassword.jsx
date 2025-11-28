import React, { useEffect, useState } from "react";
import axios from "axios";
import { Select, Space, Button, Row, Col, Form, message } from "antd";
import { KeyRound } from "lucide-react";

const SetPassword = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingIds, setLoadingIds] = useState([]);
  const [showPasswordIds, setShowPasswordIds] = useState([]);
  const [searchForm] = Form.useForm();

  // Lấy danh sách sinh viên
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("UNAUTHENTICATED");
      const res = await axios.get("http://localhost:5001/api/auth/users", {
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

  // Reset mật khẩu và lấy mật khẩu mới từ backend
  const handleResetPassword = async (id) => {
    setLoadingIds((prev) => [...prev, id]);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.put(
        `http://localhost:5001/api/auth/resetpassword/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newPassword = res.data.password || "Không có mật khẩu";
      message.success(`Mật khẩu mới: ${newPassword}`);

      // Cập nhật password trong bảng
      setUsers((prev) =>
        prev.map((u) =>
          u._id === id ? { ...u, password: newPassword } : u
        )
      );
      setFilteredUsers((prev) =>
        prev.map((u) =>
          u._id === id ? { ...u, password: newPassword } : u
        )
      );
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "❌ Lỗi khi reset mật khẩu!");
    } finally {
      setLoadingIds((prev) => prev.filter((uid) => uid !== id));
    }
  };

  // Toggle hiện/ẩn mật khẩu
  const toggleShowPassword = (id) => {
    setShowPasswordIds((prev) =>
      prev.includes(id)
        ? prev.filter((uid) => uid !== id)
        : [...prev, id]
    );
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 md:px-8 bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-2xl text-blue-700 shadow-inner">
              <KeyRound className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Quản lý mật khẩu</h2>
              <p className="text-sm text-slate-500">Xem mật khẩu sinh viên trực tiếp</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Tổng sinh viên</p>
            <p className="text-2xl font-bold text-blue-600">{filteredUsers.length}</p>
          </div>
        </div>

        {/* Form tìm kiếm */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6">
          <Form form={searchForm} onFinish={handleSearch}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12} lg={8}>
                <Form.Item name="searchText" className="mb-0">
                  <input
                    placeholder="Tìm theo mã SV, họ tên, email"
                    className="w-full p-2 border rounded-2xl"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={6}>
                <Form.Item name="passwordStatus" className="mb-0">
                  <Select placeholder="Trạng thái mật khẩu" allowClear size="large" className="rounded-2xl">
                    <Select.Option value="withPassword">Đã có mật khẩu</Select.Option>
                    <Select.Option value="withoutPassword">Chưa có mật khẩu</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={6}>
                <Form.Item name="courseFilter" className="mb-0">
                  <Select placeholder="Lọc theo khóa học" allowClear size="large" className="rounded-2xl">
                    {uniqueCourses.map((course) => (
                      <Select.Option key={course} value={course}>
                        {course}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={4} className="flex items-end">
                <Space size="middle">
                  <Button type="primary" htmlType="submit" className="!rounded-2xl">🔍 Tìm</Button>
                  <Button
                    className="!rounded-2xl"
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
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 uppercase text-xs tracking-wide">
                <tr>
                  <th className="p-4 text-left">Mã SV</th>
                  <th className="p-4 text-left">Họ tên</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Khóa học</th>
                  <th className="p-4 text-center">Mật khẩu</th>
                  <th className="p-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-blue-50 transition">
                    <td className="p-4 font-semibold text-slate-900">{u.studentCode || "—"}</td>
                    <td className="p-4">{u.fullName || "—"}</td>
                    <td className="p-4">{u.email || "—"}</td>
                    <td className="p-4">{u.course || "—"}</td>
                    <td className="p-4 text-center">
                      {!u.active ? (
                        <span className="text-rose-600 font-semibold">Đã khóa</span>
                      ) : u.password ? (
                        <span className="text-emerald-600 font-semibold">
                          {showPasswordIds.includes(u._id) ? u.password : "••••••"}
                          <Button
                            size="small"
                            type="link"
                            className="ml-2 p-0"
                            onClick={() => toggleShowPassword(u._id)}
                          >
                            {showPasswordIds.includes(u._id) ? "Ẩn" : "Xem"}
                          </Button>
                        </span>
                      ) : (
                        <span className="text-slate-500">Chưa có mật khẩu</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {u.active && (
                          <Button
                            type="default"
                            size="small"
                            danger
                            onClick={() => handleResetPassword(u._id)}
                            loading={loadingIds.includes(u._id)}
                            className="!rounded-2xl"
                          >
                            Reset mật khẩu
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-slate-400">
                      📭 Không tìm thấy sinh viên phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetPassword;
