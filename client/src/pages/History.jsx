import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Tag, Button, Space, Modal, message, Image, Input, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const STATUS_LABEL = {
  borrowed: "Đang mượn",
  overdue: "Quá hạn",
  damaged: "Mất/hỏng",
  returned: "Đã trả",
};

const STATUS_COLOR = {
  borrowed: "blue",
  overdue: "red",
  damaged: "orange",
  returned: "green",
};

const History = ({ userId, refreshFlag }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/borrowings/history/${userId}`);
      setHistory(res.data || []);
    } catch (error) {
      console.error("❌ Lỗi fetch history:", error.response?.data || error.message);
      message.error("Không thể tải lịch sử mượn!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [userId, refreshFlag]); // refreshFlag giúp cập nhật dữ liệu mới

  const handleReportLost = (id) => {
    Modal.confirm({
      title: "Xác nhận báo mất",
      content: "Bạn có chắc chắn muốn báo sách này mất không?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      async onOk() {
        try {
          await axios.put(`http://localhost:5000/api/borrowings/${id}/report-lost`);
          message.success("✅ Đã báo mất!");
          fetchHistory();
        } catch (error) {
          console.error("❌ Lỗi báo mất:", error.response?.data || error.message);
          message.error("Không thể báo mất!");
        }
      },
    });
  };

  const handleReportBroken = (record) => {
    let reason = "";
    let file = null;

    Modal.confirm({
      title: "Báo hỏng sách",
      content: (
        <div>
          <Input
            placeholder="Nhập lý do hỏng"
            onChange={(e) => reason = e.target.value}
            style={{ marginBottom: 10 }}
          />
          <Upload beforeUpload={(f) => { file = f; return false; }} maxCount={1}>
            <Button icon={<UploadOutlined />}>Chọn ảnh hỏng</Button>
          </Upload>
        </div>
      ),
      okText: "Báo hỏng",
      cancelText: "Hủy",
      async onOk() {
        if (!reason) { message.warning("Bạn phải nhập lý do!"); return Promise.reject(); }
        try {
          const formData = new FormData();
          formData.append("reason", reason);
          if (file) formData.append("image", file);

          await axios.put(
            `http://localhost:5000/api/borrowings/${record._id}/report-broken`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );

          message.success("✅ Đã báo hỏng!");
          fetchHistory();
        } catch (error) {
          console.error("❌ Lỗi báo hỏng:", error.response?.data || error.message);
          message.error("Không thể báo hỏng!");
        }
      },
    });
  };

  const columns = [
    {
      title: "Mã SV / Tên",
      dataIndex: "userSnapshot",
      key: "user",
      render: (user) => (user?.studentId || "000000") + " - " + (user?.fullName || "Khách vãng lai"),
    },
    {
      title: "Sách mượn",
      dataIndex: "bookSnapshot",
      key: "book",
      render: (book) => (
        <Space>
          <Image src={book?.images?.[0]} width={40} height={60} />
          <span>{book?.title}</span>
        </Space>
      ),
    },
    {
      title: "Ngày mượn",
      dataIndex: "borrowDate",
      key: "borrowDate",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Ngày trả",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={STATUS_COLOR[status] || "default"}>
          {STATUS_LABEL[status] || status}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => Modal.info({
              title: "Chi tiết sách mượn",
              content: (
                <div>
                  <p>Tên sách: {record.bookSnapshot?.title}</p>
                  <p>Tác giả: {record.bookSnapshot?.author?.name}</p>
                  <p>Ngày mượn: {new Date(record.borrowDate).toLocaleDateString("vi-VN")}</p>
                  <p>Ngày trả: {new Date(record.dueDate).toLocaleDateString("vi-VN")}</p>
                  <p>Trạng thái: {STATUS_LABEL[record.status]}</p>
                </div>
              ),
              okText: "Đóng"
            })}
          >
            Xem chi tiết
          </Button>
          {record.status === "borrowed" || record.status === "overdue" ? (
            <>
              <Button type="link" danger onClick={() => handleReportLost(record._id)}>Báo mất</Button>
              <Button type="link" danger onClick={() => handleReportBroken(record)}>Báo hỏng</Button>
            </>
          ) : null}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>📖 Lịch sử mượn sách</h2>
      <Table
        rowKey={(record) => record._id}
        columns={columns}
        dataSource={history}
        loading={loading}
        pagination={{ pageSize: 5 }}
        bordered
      />
    </div>
  );
};

export default History;
