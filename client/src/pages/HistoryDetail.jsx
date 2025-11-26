import React, { useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Table, Tag, Space, Image, Tooltip, Button, Modal, message } from "antd";
import dayjs from "dayjs";
import axios from "axios";
import { DollarOutlined, ArrowLeftOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
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
const HistoryDetail = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [group, setGroup] = useState(location.state?.group || null);
  const token = localStorage.getItem("clientToken");

  if (!group) {
    navigate("/history");
    return null;
  }

  const OVERDUE_FEE_PER_DAY = 5000;

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

  const renewBorrowing = async (id) => {
    try {
      if (!token) throw new Error("UNAUTHENTICATED");
      const res = await axios.put(
        `http://localhost:5000/api/borrowings/${id}/renew`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success(res.data.message || "Gia hạn thành công");
      window.location.reload();
    } catch (error) {
      message.error(error?.response?.data?.message || "Không thể gia hạn!");
    }
  };

  const handleReportLost = (id) => {
    Modal.confirm({
      title: "Xác nhận báo mất",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc chắn muốn báo sách này mất không?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      async onOk() {
        try {
          if (!token) throw new Error("UNAUTHENTICATED");
          const res = await axios.put(
            `http://localhost:5000/api/borrowings/${id}/report-lost`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const updated = res.data?.borrowing;
          message.success("✅ Đã báo mất!");

          // Cập nhật lại state để hiển thị ngay
          setGroup((prev) => {
            if (!prev) return prev;
            const items = prev.items.map((it) =>
              it._id === id
                ? {
                    ...it,
                    status: updated?.status || "lost",
                    compensationAmount:
                      updated?.compensationAmount ?? it.compensationAmount,
                    paymentStatus: updated?.paymentStatus || "pending",
                  }
                : it
            );
            return { ...prev, items };
          });
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
          if (!token) throw new Error("UNAUTHENTICATED");
          const formData = new FormData();
          formData.append("reason", reason);
          if (file) formData.append("image", file);

          const res = await axios.put(
            `http://localhost:5000/api/borrowings/${record._id}/report-broken`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const updated = res.data?.borrowing;
          message.success("✅ Đã báo hỏng!");

          setGroup((prev) => {
            if (!prev) return prev;
            const items = prev.items.map((it) =>
              it._id === record._id
                ? {
                    ...it,
                    status: updated?.status || "damaged",
                    compensationAmount:
                      updated?.compensationAmount ?? it.compensationAmount,
                    paymentStatus: updated?.paymentStatus || "pending",
                  }
                : it
            );
            return { ...prev, items };
          });
        } catch (error) {
          console.error(error);
          message.error("Không thể báo hỏng!");
        }
      },
    });
  };

  const detailColumns = [
    {
      title: "Sách mượn",
      key: "book",
      render: (_, record) => {
        const book = record.book || record.bookSnapshot || {};
        let thumb = book.images?.[0];
        if (thumb && !thumb.startsWith("http")) thumb = `http://localhost:5000/${thumb}`;
        const placeholder = "https://via.placeholder.com/40x60?text=?";
        return (
          <Space>
            <Image width={40} height={60} src={thumb || placeholder} />
            <span>
              {book.title || "—"}
              {book.author ? ` — ${book.author.name || book.author}` : ""}
            </span>
          </Space>
        );
      },
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity) => (
        <span className="font-semibold text-blue-600">{quantity || 1} quyển</span>
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
        const displayStatus = !record.isPickedUp
          ? "pendingPickup"
          : record.status === "borrowed" && new Date(record.dueDate) < new Date()
          ? "overdue"
          : record.status;

        return (
          <div>
            <Tag color={STATUS_COLOR[displayStatus] || "default"}>
              {STATUS_LABEL[displayStatus] || displayStatus}
            </Tag>
            {["damaged", "lost"].includes(record.status) &&
              record.paymentStatus === "pending" && (
                <Tag color="gold" style={{ marginTop: 4 }}>
                  Chờ xác nhận thanh toán
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
            onClick={() =>
              Modal.info({
                title: "Chi tiết sách mượn",
                content: (
                  <div>
                    <p>{record.book?.title || record.bookSnapshot?.title}</p>
                    <p>
                      Trạng thái:{" "}
                      {STATUS_LABEL[!record.isPickedUp ? "pendingPickup" : record.status]}
                    </p>
                    {["damaged", "lost"].includes(record.status) &&
                      record.compensationAmount > 0 && (
                        <p>
                          Tiền đền:{" "}
                          {record.compensationAmount.toLocaleString("vi-VN")} VNĐ
                        </p>
                      )}
                    {record.status === "borrowed" &&
                      new Date(record.dueDate) < new Date() && (
                        <p>
                          Tiền quá hạn:{" "}
                          {calculateOverdueFee(record).toLocaleString("vi-VN")} VNĐ
                        </p>
                      )}
                  </div>
                ),
                width: 400,
                okText: "Đóng",
              })
            }
          >
            Xem chi tiết
          </Button>

          {(record.status === "borrowed" ||
            record.status === "renewed" ||
            record.status === "pendingPickup" ||
            record.status === "overdue") && (
            <>
              {record.isPickedUp && ["borrowed", "overdue"].includes(record.status) && (
                <>
                  <Button
                    type="link"
                    danger
                    size="small"
                    onClick={() => handleReportLost(record._id)}
                  >
                    Báo mất
                  </Button>
                  <Button
                    type="link"
                    danger
                    size="small"
                    onClick={() => handleReportBroken(record)}
                  >
                    Báo hỏng
                  </Button>
                </>
              )}
              {record.status === "borrowed" && (record.renewCount || 0) < 3 ? (
                <Button
                  type="link"
                  size="small"
                  onClick={() => renewBorrowing(record._id)}
                >
                  Gia hạn
                </Button>
              ) : record.status === "borrowed" && (record.renewCount || 0) >= 3 ? (
                <span className="text-sm text-gray-500">Đã hết lượt gia hạn</span>
              ) : null}
            </>
          )}

          {["damaged", "lost"].includes(record.status) &&
            record.compensationAmount > 0 &&
            record.paymentStatus !== "completed" && (
              <Button
                type="primary"
                icon={<DollarOutlined />}
                onClick={() => navigate(`/payment/${record._id}`)}
              >
                Thanh toán
              </Button>
            )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "0 40px 24px" }}>
      <div style={{ marginBottom: 16 }}>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            margin: 0,
            color: "#1677ff",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span role="img" aria-label="detail">
            📖
          </span>
          <span>Chi tiết đơn mượn</span>
        </h2>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          border: "1px solid #f0f0f0",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <p style={{ margin: 0, fontWeight: 600 }}>
              Mã đơn:{" "}
              <span style={{ color: "#1677ff" }}>{group.borrowingCode || code}</span>
            </p>
            <p style={{ margin: "4px 0 0", color: "#555" }}>
              Ngày mượn:{" "}
              <strong>
                {group.borrowDate ? dayjs(group.borrowDate).format("DD/MM/YYYY") : "—"}
              </strong>{" "}
              • Ngày trả:{" "}
              <strong>
                {group.dueDate ? dayjs(group.dueDate).format("DD/MM/YYYY") : "—"}
              </strong>
            </p>
            <p style={{ margin: "4px 0 0", color: "#555" }}>
              Tổng số sách:{" "}
              <span style={{ fontWeight: 600, color: "#1677ff" }}>
                {group.totalQuantity} quyển
              </span>
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <Tag color={STATUS_COLOR[group.summaryStatus] || "default"}>
              {STATUS_LABEL[group.summaryStatus] || group.summaryStatus}
            </Tag>
            {group.totalCompensation > 0 && (
              <div style={{ marginTop: 4, color: "red", fontWeight: 600, fontSize: 12 }}>
                <DollarOutlined />{" "}
                Tổng tiền: {group.totalCompensation.toLocaleString("vi-VN")} VNĐ
              </div>
            )}
          </div>
        </div>

        <Table
          rowKey={(r) => r._id}
          columns={detailColumns}
          dataSource={group.items}
          pagination={false}
          bordered
        />

        <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between" }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            Quay lại lịch sử
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HistoryDetail;


