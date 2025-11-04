import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Tag, Button, message, Space } from "antd";
import { CheckCircleOutlined, SyncOutlined } from "@ant-design/icons";

const BorrowManager = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBorrowings = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/borrowings");
      setData(res.data);
    } catch (err) {
      console.error("Lỗi khi tải đơn mượn:", err);
      message.error("Không thể tải danh sách đơn mượn!");
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/borrowings/${id}/return`);
      message.success("Đã xác nhận trả sách!");
      fetchBorrowings();
    } catch (err) {
      console.error("Lỗi khi xác nhận:", err);
      message.error("Không thể xác nhận đơn!");
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const columns = [
    {
      title: "Tên sinh viên",
      dataIndex: ["userSnapshot", "fullName"],
      key: "fullName",
      render: (text, record) =>
        record.userSnapshot?.fullName || record.user?.fullName || "Không có",
    },
    {
      title: "Email",
      dataIndex: ["userSnapshot", "email"],
      key: "email",
      render: (text, record) =>
        record.userSnapshot?.email || record.user?.email || "Không có",
    },
    {
      title: "Tên sách",
      dataIndex: ["bookSnapshot", "title"],
      key: "title",
      render: (text, record) =>
        record.bookSnapshot?.title || record.book?.title || "Không có",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
    },
    {
      title: "Ngày mượn",
      dataIndex: "borrowDate",
      key: "borrowDate",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Hạn trả",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "borrowed" ? "orange" : "green"}>
          {status === "borrowed" ? "Đang mượn" : "Đã trả"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          {record.status === "borrowed" ? (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleReturn(record._id)}
            >
              Xác nhận trả
            </Button>
          ) : (
            <Tag icon={<SyncOutlined />} color="default">
              Hoàn tất
            </Tag>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>📚 Quản lý đơn mượn sách</h2>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={data}
        loading={loading}
        bordered
      />
    </div>
  );
};

export default BorrowManager;
