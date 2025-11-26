import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Tag, Button, Space, Modal, message, Image, Tooltip } from "antd";
import { DollarOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const STATUS_LABEL = {
  borrowed: "Đang mượn",
  renewed: "Đã gia hạn",
  pendingPickup: "Chưa lấy sách",
  returned: "Đã trả",
  damaged: "Hỏng",
  lost: "Mất",
  compensated: "Đã đền bù",
  overdue: "Quá hạn",
};

const STATUS_COLOR = {
  borrowed: "cyan",
  renewed: "cyan",
  pendingPickup: "blue",
  returned: "green",
  damaged: "red",
  lost: "red",
  compensated: "gold",
  overdue: "orange",
};

const OVERDUE_FEE_PER_DAY = 5001;

const History = ({ userId, refreshFlag }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("clientToken");
  const storedUser = JSON.parse(localStorage.getItem("clientUser") || "null");
  const effectiveUserId = userId || storedUser?._id || storedUser?.id;
  const navigate = useNavigate();

  const renewBorrowing = async (id) => {
    try {
      const res = await axios.put(`http://localhost:5001/api/borrowings/${id}/renew`, {}, { headers: { Authorization: `Bearer ${token}` } });
      message.success(res.data.message || "Gia hạn thành công");
      fetchHistory();
    } catch (error) {
      message.error(error?.response?.data?.message || "Không thể gia hạn!");
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      if (!token || !effectiveUserId) throw new Error("UNAUTHENTICATED");
      const res = await axios.get(`http://localhost:5001/api/borrowings/history/${effectiveUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data || [];
      // Nếu admin đã xác nhận lấy sách, chuyển trạng thái pendingPickup -> borrowed
      const mapped = data.map((b) => {
        if ((b.status === "borrowed" || b.status === "renewed") && b.isPickedUp) b.status = b.status;
        if ((b.status === "borrowed" || b.status === "renewed") && !b.isPickedUp) b.status = "pendingPickup";
        return b;
      });
      setHistory(mapped);
    } catch (error) {
      console.error("❌ Lỗi fetch history:", error);
      message.error("Không thể tải lịch sử mượn!");
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
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc chắn muốn báo sách này mất không?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      async onOk() {
        try {
          await axios.put(
            `http://localhost:5001/api/borrowings/${id}/report-lost`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          message.success("✅ Đã báo mất!");
          fetchHistory();
        } catch (error) {
          console.error(error);
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
          <input
            placeholder="Nhập lý do hỏng"
            onChange={(e) => (reason = e.target.value)}
            style={{ width: "100%", marginBottom: 10, padding: 4 }}
          />
          <input type="file" onChange={(e) => (file = e.target.files[0])} />
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
            `http://localhost:5001/api/borrowings/${record._id}/report-broken`,
            formData,
            { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` } }
          );
          message.success("✅ Đã báo hỏng!");
          fetchHistory();
        } catch (error) {
          console.error(error);
          message.error("Không thể báo hỏng!");
        }
      },
    });
  };

  const calculateOverdueFee = (record) => {
    if (!record.dueDate) return 0;
    const due = new Date(record.dueDate);
    const now = new Date();
    if (record.status === "borrowed" && now > due) {
      const diffDays = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
      return diffDays * OVERDUE_FEE_PER_DAY;
    }
    return 0;
  };

  const columns = [
    {
      title: "Sách mượn",
      key: "book",
      render: (_, record) => {
        const book = record.book || record.bookSnapshot || {};
        let thumb = book.images?.[0];
        if (thumb && !thumb.startsWith("http")) thumb = `http://localhost:5001/${thumb}`;
        const placeholder = "https://via.placeholder.com/40x60?text=?";
        return (
          <Space>
            <Image width={40} height={60} src={thumb || placeholder} />
            <span>{book.title || "—"}{book.author ? ` — ${book.author.name || book.author}` : ""}</span>
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
        title: "Lần gia hạn",
        dataIndex: "renewCount",
        key: "renewCount",
        render: (renewCount, record) => (
          <span>
            {renewCount || 0}
            {renewCount >= 3 && (
              <span className="ml-2 text-xs text-red-500">(Đã hết lượt gia hạn)</span>
            )}
          </span>
        ),
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
        let displayStatus = !record.isPickedUp
          ? "pendingPickup"
          : record.status === "borrowed" && new Date(record.dueDate) < new Date()
            ? "overdue"
            : record.status;

        let total = 0;
        if (["damaged", "lost"].includes(record.status)) {
          total = record.compensationAmount || 0;
        } else if (displayStatus === "overdue") {
          total = calculateOverdueFee(record);
        }

        return (
          <div>
            <Tag color={STATUS_COLOR[displayStatus] || "default"}>
              {STATUS_LABEL[displayStatus] || displayStatus}
            </Tag>
            {total > 0 && (
              <Tooltip title={`Tổng: ${total.toLocaleString("vi-VN")} VNĐ`}>
                <div style={{ color: "red", fontWeight: 600 }}>{total.toLocaleString("vi-VN")} VNĐ</div>
              </Tooltip>
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
          <Button type="link" onClick={() => Modal.info({
            title: "Chi tiết sách mượn",
            content: (
              <div>
                <p>{record.book?.title || record.bookSnapshot?.title}</p>
                <p>Trạng thái: {STATUS_LABEL[!record.isPickedUp ? "pendingPickup" : record.status]}</p>
                {["damaged", "lost"].includes(record.status) && record.compensationAmount > 0 &&
                  <p>Tiền đền: {record.compensationAmount.toLocaleString("vi-VN")} VNĐ</p>}
                {record.status === "borrowed" && new Date(record.dueDate) < new Date() &&
                  <p>Tiền quá hạn: {calculateOverdueFee(record).toLocaleString("vi-VN")} VNĐ</p>}
              </div>
            ),
            width: 400,
            okText: "Đóng",
          })}>Xem chi tiết</Button>

          {(record.status === "borrowed" || record.status === "renewed" || record.status === "pendingPickup" || record.status === "overdue") && (
            <>
              {(record.isPickedUp && ["borrowed", "overdue"].includes(record.status)) && (
                <>
                  <Button type="link" danger size="small" onClick={() => handleReportLost(record._id)}>Báo mất</Button>
                  <Button type="link" danger size="small" onClick={() => handleReportBroken(record)}>Báo hỏng</Button>
                </>
              )}
              {record.status === "borrowed" && (record.renewCount || 0) < 3 ? (
                <Button type="link" size="small" onClick={() => renewBorrowing(record._id)}>Gia hạn</Button>
              ) : record.status === "borrowed" && (record.renewCount || 0) >= 3 ? (
                <span className="text-sm text-gray-500">Đã hết lượt gia hạn</span>
              ) : null}
            </>
          )}

          {["damaged", "lost"].includes(record.status) && record.compensationAmount > 0 && record.paymentStatus !== "completed" && (
            <Button type="primary" icon={<DollarOutlined />} onClick={() => navigate(`/payment/${record._id}`)}>
              Thanh toán
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
        rowKey={r => r._id}
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
