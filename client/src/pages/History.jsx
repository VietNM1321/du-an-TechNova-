import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Tag, Button, Space, Modal, message, Image, Input, Upload, Tooltip } from "antd";
import { UploadOutlined, DollarOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const STATUS_LABEL = {
  borrowed: "Đang mượn",
  pendingPickup: "Chưa lấy sách",
  returned: "Đã trả",
  damaged: "Hỏng",
  lost: "Mất",
  compensated: "Đã đền bù",
  overdue: "Quá hạn",
};

const STATUS_COLOR = {
  borrowed: "cyan",
  pendingPickup: "blue",
  returned: "green",
  damaged: "red",
  lost: "red",
  compensated: "gold",
  overdue: "orange",
};

const History = ({ userId, refreshFlag }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("clientToken");
  const storedUser = JSON.parse(localStorage.getItem("clientUser") || "null");
  const effectiveUserId = userId || storedUser?._id || storedUser?.id;

  const fetchHistory = async () => {
    try {
      setLoading(true);
      if (!token || !effectiveUserId) throw new Error("UNAUTHENTICATED");
      const res = await axios.get(`http://localhost:5000/api/borrowings/history/${effectiveUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data || [];
      // Nếu admin đã xác nhận lấy sách, chuyển trạng thái pendingPickup -> borrowed
      const mapped = data.map((b) => {
        if (b.status === "borrowed" && b.isPickedUp) b.status = "borrowed";
        if (b.status === "borrowed" && !b.isPickedUp) b.status = "pendingPickup";
        return b;
      });
      setHistory(mapped);
    } catch (error) {
      console.error("❌ Lỗi fetch history:", error.response?.data || error.message);
      if (error.message === "UNAUTHENTICATED" || error.response?.status === 401) {
        message.warning("Vui lòng đăng nhập để xem lịch sử mượn.");
      } else {
        message.error("Không thể tải lịch sử mượn!");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [effectiveUserId, refreshFlag]);

  const handleReportLost = (id) => {
    Modal.confirm({
      title: "Xác nhận báo mất",
      content: "Bạn có chắc chắn muốn báo sách này mất không?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      async onOk() {
        try {
          await axios.put(
            `http://localhost:5000/api/borrowings/${id}/report-lost`,
            null,
            { headers: { Authorization: `Bearer ${token}` } }
          );
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
            onChange={(e) => (reason = e.target.value)}
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
        if (!reason) {
          message.warning("Bạn phải nhập lý do!");
          return Promise.reject();
        }
        try {
          const formData = new FormData();
          formData.append("reason", reason);
          if (file) formData.append("image", file);
          await axios.put(
            `http://localhost:5000/api/borrowings/${record._id}/report-broken`,
            formData,
            { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` } }
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
      title: "Sách mượn",
      key: "book",
      render: (_, record) => {
        const book = record.book || record.bookSnapshot || {};
        const authorName = book.author?.name || record.book?.author?.name || "";
        let thumb = book.images?.[0] || null;
        if (thumb && !thumb.startsWith("http")) thumb = `http://localhost:5000/${thumb}`;
        const placeholder = "https://via.placeholder.com/40x60?text=?";
        return (
          <Space>
            <Image src={thumb || placeholder} width={40} height={60} />
            <span>{book?.title || "—"}{authorName ? ` — ${authorName}` : ""}</span>
          </Space>
        );
      },
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity) => (
        <span className="font-semibold text-blue-600">
          {quantity || 1} quyển
        </span>
      ),
    },
    {
      title: "Ngày mượn",
      dataIndex: "borrowDate",
      key: "borrowDate",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "—"),
    },
    {
      title: "Ngày trả",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "—"),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => {
        let penalty = 0;
        let overdueDays = 0;
        if (record.dueDate && !record.returnDate) {
          const due = new Date(record.dueDate);
          const today = new Date();
          overdueDays = Math.max(0, Math.floor((today - due) / (1000 * 60 * 60 * 24)));
          penalty = overdueDays * 500;
        }
        const compensation = record.compensationAmount || 0;
        const total = penalty + compensation;

        return (
          <div>
            <Tag color={STATUS_COLOR[record.status] || "default"}>
              {STATUS_LABEL[record.status] || record.status}
            </Tag>
            {total > 0 && (
              <Tooltip title={`Phạt ${penalty.toLocaleString("vi-VN")} VNĐ (${overdueDays} ngày quá hạn)`}>
                <div className="text-right font-semibold text-red-600 mt-1">
                  {total.toLocaleString("vi-VN")} VNĐ
                </div>
              </Tooltip>
            )}
            {record.paymentStatus && (record.status === "damaged" || record.status === "lost") && (
              <Tag color={record.paymentStatus === "completed" ? "green" : "orange"} className="mt-1">
                {record.paymentStatus === "completed" ? "Đã thanh toán" : "Chờ thanh toán"}
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Button
            type="link"
            size="small"
            onClick={() =>
              Modal.info({
                title: "Chi tiết sách mượn",
                content: (
                  <div>
                    <p>Tên sách: {record.book?.title || record.bookSnapshot?.title || "—"}</p>
                    <p>Tác giả: {record.book?.author?.name || record.bookSnapshot?.author?.name || "—"}</p>
                    <p><strong>Số lượng mượn:</strong> {record.quantity || 1} quyển</p>
                    <p>Ngày mượn: {dayjs(record.borrowDate).format("DD/MM/YYYY")}</p>
                    <p>Ngày trả: {dayjs(record.dueDate).format("DD/MM/YYYY")}</p>
                    {record.returnDate && (
                      <p>Ngày trả thực tế: {dayjs(record.returnDate).format("DD/MM/YYYY")}</p>
                    )}
                    <p>Trạng thái: {STATUS_LABEL[record.status]}</p>
                    {record.compensationAmount > 0 && (
                      <>
                        <p>Tiền đền: {record.compensationAmount.toLocaleString("vi-VN")} VNĐ</p>
                        <p>Phương thức: {record.paymentMethod === "cash" ? "Tiền mặt" : "Ngân hàng"}</p>
                        <p>Trạng thái thanh toán: {record.paymentStatus === "completed" ? "Đã hoàn tất" : "Chờ thanh toán"}</p>
                      </>
                    )}
                  </div>
                ),
                okText: "Đóng",
                width: 500,
              })
            }
          >
            Xem chi tiết
          </Button>

          {(record.status === "borrowed" || record.status === "pendingPickup" || record.status === "overdue") && (
            <>
              <Button type="link" danger size="small" onClick={() => handleReportLost(record._id)}>Báo mất</Button>
              <Button type="link" danger size="small" onClick={() => handleReportBroken(record)}>Báo hỏng</Button>
            </>
          )}

          {(record.status === "damaged" || record.status === "lost") && record.compensationAmount > 0 && record.paymentStatus !== "completed" && (
            <Button
              type="primary"
              size="small"
              icon={<DollarOutlined />}
              onClick={() => navigate(`/payment/${record._id}`)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              💳 Thanh toán
            </Button>
          )}
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
