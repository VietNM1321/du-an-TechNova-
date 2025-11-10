import React, { useEffect, useState } from "react";
import { Table, Button, message, Space } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi tải danh sách thông báo!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa thông báo này?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/notifications/${id}`);
      message.success("Xóa thông báo thành công!");
      fetchNotifications();
    } catch (err) {
      console.error(err);
      message.error("Xóa thông báo thất bại!");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const columns = [
    { 
      title: "Tiêu đề", 
      dataIndex: "title", 
      key: "title"
    },
    { 
      title: "Ngày thông báo", 
      dataIndex: "date", 
      key: "date",
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => navigate(`/admin/notifications/edit/${record._id}`)}>
            Sửa
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record._id)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📄 Danh sách thông báo</h2>
      <Button
        type="primary"
        className="mb-4"
        onClick={() => navigate("/admin/notifications/add")}
      >
        Thêm thông báo
      </Button>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={notifications}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default NotificationList;
