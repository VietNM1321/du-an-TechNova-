import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users as UsersIcon } from "lucide-react";
import { Select, Row, Col, Form, Button, Modal, Input, message, Space } from "antd";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingIds, setLoadingIds] = useState([]);
  const [searchForm] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const adminToken = localStorage.getItem("adminToken");
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${adminToken}` };
      const [resAuth, resUsers] = await Promise.all([
        axios.get("http://localhost:5000/api/auth/users", { headers }),
        axios.get("http://localhost:5000/api/users", { headers }).catch(() => ({ data: { users: [] } })),
      ]);
      const authUsers = resAuth.data || [];
      const extra = resUsers.data?.users || [];
      const extraMap = {};
      extra.forEach((e) => {
        extraMap[e._id] = e;
      });
      const merged = authUsers.map((u) => ({
        ...u,
        forgotPassword: extraMap[u._id]?.forgotPassword || false,
        passwordRegistered: u.password ? true : false,
      }));
      setUsers(merged);
      // Filter to show only students initially
      const studentUsers = merged.filter((u) => u.role === "student");
      setFilteredUsers(studentUsers);
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  const refreshUserData = async () => {
    try {
      const headers = { Authorization: `Bearer ${adminToken}` };
      const res = await axios.get(`http://localhost:5000/api/auth/users`, { headers });
      const updatedUsers = res.data || [];
      setUsers(updatedUsers);
      // Filter to show only students
      const studentUsers = updatedUsers.filter((u) => u.role === "student");
      setFilteredUsers(studentUsers);
    } catch (err) {
      console.error("Lỗi refresh dữ liệu:", err);
    }
  };
  const toggleActive = async (id) => {
    try {
      setLoadingIds((prev) => [...prev, id]);
      await axios.put(`http://localhost:5000/api/auth/users/${id}/toggle-active`, {}, { headers: { Authorization: `Bearer ${adminToken}` } });
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, active: !u.active } : u)));
      setFilteredUsers((prev) => prev.map((u) => (u._id === id ? { ...u, active: !u.active } : u)));
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Không thể thay đổi trạng thái");
    } finally {
      setLoadingIds((prev) => prev.filter((i) => i !== id));
    }
  };
  const autoSetPassword = async (id) => {
    try {
      setLoadingIds((prev) => [...prev, id]);
      const res = await axios.put(`http://localhost:5000/api/auth/setpassword/${id}`, {}, { headers: { Authorization: `Bearer ${adminToken}` } });
      message.success(res.data?.message || "Cấp mật khẩu thành công!");
      await refreshUserData();
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Không thể cấp mật khẩu");
    } finally {
      setLoadingIds((prev) => prev.filter((i) => i !== id));
    }
  };
  const openResetModal = (id) => {
    setSelectedUserId(id);
    setModalVisible(true);
  };
  const handleConfirmReset = async () => {
    setLoadingIds((prev) => [...prev, selectedUserId]);
    try {
      const res = await axios.put(`http://localhost:5000/api/auth/autoreset/${selectedUserId}`,
        {},
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      message.success(res.data?.message || "Reset mật khẩu thành công! Email đã được gửi.");
      await refreshUserData();
      setModalVisible(false);
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Lỗi khi reset mật khẩu");
    } finally {
      setLoadingIds((prev) => prev.filter((i) => i !== selectedUserId));
    }
  };
  const handleSearch = (values) => {
    let filtered = users.filter((u) => u.role === "student");
    
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
        values.passwordStatus === "withPassword" ? u.passwordRegistered : !u.passwordRegistered
      );
    }
    if (values.courseFilter) {
      filtered = filtered.filter((u) => u.course && u.course.toLowerCase() === values.courseFilter.toLowerCase());
    }
    setFilteredUsers(filtered);
  };

  const uniqueCourses = [...new Set(users.map((u) => u.course).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 flex items-center justify-center text-slate-500">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-2xl text-blue-700 shadow-inner">
              <UsersIcon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Quản lý người dùng</h2>
              <p className="text-sm text-slate-500">Theo dõi tài khoản sinh viên, mật khẩu và trạng thái</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Tổng người dùng</p>
            <p className="text-2xl font-bold text-blue-600">{users.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6">
          <Form form={searchForm} onFinish={handleSearch} layout="vertical">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12} lg={8}>
                <Form.Item name="searchText" className="mb-0">
                  <input placeholder="Tìm theo mã SV, họ tên, email" className="w-full p-2 border rounded-2xl" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={6}>
                <Form.Item name="passwordStatus" className="mb-0">
                  <Select placeholder="Trạng thái mật khẩu" allowClear size="large" className="rounded-2xl">
                    <Select.Option value="withPassword">Đã đăng ký</Select.Option>
                    <Select.Option value="withoutPassword">Chưa đăng ký</Select.Option>
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

        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 uppercase text-xs tracking-wide">
                <tr>
                  <th className="p-4 text-left">Mã SV</th>
                  <th className="p-4 text-left">Họ tên</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Khóa học</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 text-center">Trạng thái mật khẩu</th>
                  <th className="p-4 text-center">Yêu cầu mật khẩu</th>
                  <th className="p-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-400">Không có người dùng</td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-blue-50 transition">
                      <td className="p-4 font-semibold text-slate-900">{u.studentCode || "—"}</td>
                      <td className="p-4">{u.fullName || "—"}</td>
                      <td className="p-4">{u.email || "—"}</td>
                      <td className="p-4">{u.course || "—"}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold ${u.active ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                          {u.active ? "Hoạt động" : "Bị khóa"}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {u.passwordRegistered ? (
                          <span className="text-emerald-600 font-semibold">Đã đăng ký</span>
                        ) : (
                          <span className="text-slate-500">Chưa đăng ký</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {u.passwordStatus === "granted" ? (
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">Đã cấp</span>
                        ) : u.passwordStatus === "reset" ? (
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">Đã reset</span>
                        ) : (
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold text-slate-500">—</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <button
                            onClick={() => toggleActive(u._id)}
                            className={`px-4 py-2 rounded-2xl text-xs font-semibold text-white ${u.active ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-500 hover:bg-emerald-600"} transition`}
                          >
                            {u.active ? "Khóa" : "Mở khóa"}
                          </button>

                          <button
                            onClick={() => openResetModal(u._id)}
                            disabled={!u.active}
                            className={`px-3 py-2 rounded-2xl text-xs font-semibold border border-red-200 text-red-600 ${u.active ? "bg-white hover:bg-red-50" : "bg-slate-50 cursor-not-allowed"} transition`}
                          >
                            Reset mật khẩu
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        title="Xác nhận Reset Mật Khẩu"
        open={modalVisible}
        onOk={handleConfirmReset}
        onCancel={() => setModalVisible(false)}
        okText="Xác nhận Reset"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p className="text-gray-700 mb-3">
          Bạn có chắc chắn muốn reset mật khẩu cho người dùng này? Một mật khẩu mới sẽ được tạo tự động và gửi qua email.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <p className="font-semibold mb-1">📧 Email sẽ được gửi chứa:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Mật khẩu mới tự động (6 chữ số)</li>
            <li>Hướng dẫn đăng nhập và đổi mật khẩu</li>
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default Users;

