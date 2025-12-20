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
    if (["borrowed", "overdue"].includes(record.status) && now > due) {
      const diffDays = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
      return diffDays * OVERDUE_FEE_PER_DAY;
    }
    return 0;
  };

  const isWithinOneDayOfDueDate = (dueDate) => {
    if (!dueDate) return false;
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);
    return diffDays <= 1 && diffDays >= 0; // Còn 1 ngày hoặc ít hơn, và chưa quá hạn
  };


  const handleRenewWithConfirm = (record) => {
    Modal.confirm({
      title: "Xác nhận gia hạn sách?",
      content: `Gia hạn sách "${record.book?.title || record.bookSnapshot?.title || "N/A"}" thêm 7 ngày?`,
      icon: <ExclamationCircleOutlined />,
      okText: "Xác nhận gia hạn",
      cancelText: "Hủy",
      async onOk() {
        try {
          if (!token) throw new Error("UNAUTHENTICATED");
          
          const res = await axios.put(
            `http://localhost:5000/api/borrowings/${record._id}/renew`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          message.success(res.data.message || "✅ Gia hạn thành công!");
          
          // Cập nhật state ngay lập tức thay vì reload
          setGroup((prev) => {
            if (!prev) return prev;
            const items = prev.items.map((it) =>
              it._id === record._id
                ? {
                    ...it,
                    status: "renewed",
                    renewCount: (it.renewCount || 0) + 1,
                    dueDate: new Date(new Date(it.dueDate).getTime() + 7 * 24 * 60 * 60 * 1000)
                  }
                : it
            );
            return { ...prev, items };
          });
        } catch (error) {
          console.error(error);
          message.error(error?.response?.data?.message || "Không thể gia hạn!");
        }
      },
    });
  };
  const handleReportDamage = (record) => {
    let reportType = "lost"; // Mặc định là báo mất
    let reason = "";
    let file = null;
    Modal.confirm({
      title: "Báo cáo sách mất/hỏng",
      content: (
        <div style={{ padding: "10px 0" }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
              Loại báo cáo:
            </label>
            <select
              defaultValue="lost"
              onChange={(e) => (reportType = e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #d9d9d9",
                borderRadius: 4,
                fontSize: "14px"
              }}
            >
              <option value="lost">📕 Báo mất sách</option>
              <option value="damaged">🔧 Báo hỏng sách</option>
            </select>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
              Lý do <span style={{ color: "red" }}>*</span>:
            </label>
            <textarea
              placeholder="Nhập lý do chi tiết..."
              onChange={(e) => (reason = e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #d9d9d9",
                borderRadius: 4,
                fontSize: "14px",
                minHeight: "60px",
                resize: "vertical"
              }}
            />
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
              Ảnh minh họa (không bắt buộc):
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => (file = e.target.files[0])}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ marginTop: 12, padding: "8px", backgroundColor: "#fff7e6", borderRadius: 4 }}>
            <strong>Lưu ý:</strong> Khi báo cáo, toàn bộ {record.quantity || 1} cuốn sách sẽ được đánh dấu là {reportType === "lost" ? "mất" : "hỏng"} và cần thanh toán bồi thường.
          </div>
        </div>
      ),
      okText: "Xác nhận báo cáo",
      cancelText: "Hủy",
      width: 500,
      async onOk() {
        if (!reason || reason.trim() === "") {
          message.warning("Bạn phải nhập lý do báo cáo!");
          return Promise.reject();
        }
        try {
          if (!token) throw new Error("UNAUTHENTICATED");
          const formData = new FormData();
          formData.append("status", reportType);
          formData.append("reason", reason);
          formData.append("quantityAffected", record.quantity || 1); // Báo hết tất cả quantity
          if (file) formData.append("image", file);
          const res = await axios.put(
            `http://localhost:5000/api/borrowings/${record._id}/user-report`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const updated = res.data?.borrowing;
          const statusText = reportType === "lost" ? "mất" : "hỏng";
          message.success(`✅ Đã báo ${statusText} sách thành công!`);
          setGroup((prev) => {
            if (!prev) return prev;
            const items = prev.items.map((it) =>
              it._id === record._id
                ? {
                    ...it,
                    status: updated?.status || reportType,
                    compensationAmount: updated?.compensationAmount ?? it.compensationAmount,
                    paymentStatus: updated?.paymentStatus || "pending",
                  }
                : it
            );
            return { ...prev, items };
          });
        } catch (error) {
          console.error(error);
          message.error(error?.response?.data?.message || "Không thể báo cáo!");
        }
      },
    });
  };
  const handlePay = async (record) => {
  try {
    const token = localStorage.getItem("clientToken") || localStorage.getItem("adminToken");
    if (!token) {
      message.error("Bạn cần đăng nhập!");
      navigate("/login");
      return;
    }
    console.log("💳 Paying for borrowing:", record._id, "amount:", record.compensationAmount);
    const res = await axios.post(
      "http://localhost:5000/vnpay/create_payment_for_borrowing",
      {
        borrowingId: record._id,
        borrowId: record._id,
        amount: record.compensationAmount,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("✅ Payment response:", res.data);
    // server may return either `paymentUrl` or `url` depending on route
    const redirectUrl = res.data?.paymentUrl || res.data?.url;
    if (redirectUrl) {
      window.location.href = redirectUrl;
      return;
    }
    message.error("Không tạo được giao dịch VNPay.");
  } catch (error) {
    console.error("❌ Payment error:", error.response?.data || error.message);
    message.error(error.response?.data?.error || "Lỗi thanh toán!");
  }
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
        let displayStatus = !record.isPickedUp
          ? "pendingPickup"
          : record.status === "borrowed" && new Date(record.dueDate) < new Date()
          ? "overdue"
          : record.status;
        // Show compensated if payment already completed
        if (record.paymentStatus === "completed") displayStatus = "compensated";

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
            {record.status === "overdue" && 
              record.paymentStatus !== "completed" && (
                <Tag color="gold" style={{ marginTop: 4 }}>
                  Cần thanh toán phí quá hạn
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
                      {STATUS_LABEL[record.paymentStatus === "completed" ? "compensated" : (!record.isPickedUp ? "pendingPickup" : record.status)]}
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
                <Button
                  type="link"
                  danger
                  size="small"
                  onClick={() => handleReportDamage(record)}
                  style={{ border: "1px solid #ff4d4f", borderRadius: 4, padding: "2px 8px" }}
                >
                  🚨 Báo mất/hỏng
                </Button>
              )}
            {record.status === "borrowed" && 
               isWithinOneDayOfDueDate(record.dueDate) && 
               (record.renewCount || 0) < 3 ? (
                <Button
                  type="link"
                  size="small"
                  style={{ color: "#faad14" }}
                  onClick={() => handleRenewWithConfirm(record)}
                >
                  🔄 Gia hạn ({3 - (record.renewCount || 0)} lượt)
                </Button>
              ) : record.status === "borrowed" && 
                  isWithinOneDayOfDueDate(record.dueDate) && 
                  (record.renewCount || 0) >= 3 ? (
                <span className="text-sm text-gray-500">Đã hết lượt gia hạn</span>
              ) : record.status === "borrowed" && 
                  !isWithinOneDayOfDueDate(record.dueDate) ? (
                <span className="text-sm text-gray-400">
                  Gia hạn khi còn 1 ngày
                </span>
              ) : null}
            </>
          )}

          {["damaged", "lost"].includes(record.status) &&
            record.compensationAmount > 0 &&
            record.paymentStatus !== "completed" && (
              <Button
                type="primary"
                icon={<DollarOutlined />}
                onClick={() => handlePay(record)}>
                Thanh toán
              </Button>
            )}
          {record.status === "overdue" && 
            calculateOverdueFee(record) > 0 &&
            record.paymentStatus !== "completed" && (
              <Button
                type="primary"
                icon={<DollarOutlined />}
                onClick={() => {
                  // Tạo object tạm để thanh toán phí overdue
                  const overdueRecord = {
                    ...record,
                    compensationAmount: calculateOverdueFee(record),
                  };
                  handlePay(overdueRecord);
                }}>
                Thanh toán ({calculateOverdueFee(record).toLocaleString("vi-VN")} VNĐ)
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