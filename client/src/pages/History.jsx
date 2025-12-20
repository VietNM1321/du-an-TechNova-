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

const OVERDUE_FEE_PER_DAY = 5000;

const History = ({ userId, refreshFlag }) => {
  const [history, setHistory] = useState([]);           // dữ liệu thô từ API (từng sách)
  const [groupedHistory, setGroupedHistory] = useState([]); // danh sách đơn lớn đã gộp
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("clientToken");
  const storedUser = JSON.parse(localStorage.getItem("clientUser") || "null");
  const effectiveUserId = userId || storedUser?._id || storedUser?.id;
  const navigate = useNavigate();

  const renewBorrowing = async (id) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/borrowings/${id}/renew`, {}, { headers: { Authorization: `Bearer ${token}` } });
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
      const res = await axios.get(`http://localhost:5000/api/borrowings/history/${effectiveUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data || [];
      // Nếu admin đã xác nhận lấy sách, chuyển trạng thái pendingPickup -> borrowed
      const mapped = data.map((b) => {
        if ((b.status === "borrowed" || b.status === "renewed") && b.isPickedUp) b.status = b.status;
        if ((b.status === "borrowed" || b.status === "renewed") && !b.isPickedUp) b.status = "pendingPickup";
        return b;
      });

      // Gom các đơn mượn cùng ngày (và cùng mã đơn) thành 1 "đơn lớn"
      const groupsMap = new Map();

      mapped.forEach((b) => {
        // Nếu backend đã gộp mã đơn cho cùng ngày thì ưu tiên group theo borrowingCode
        // nếu không có thì fallback theo ngày mượn + ngày trả (định dạng YYYY-MM-DD)
        const borrowDate = b.borrowDate ? dayjs(b.borrowDate).format("YYYY-MM-DD") : "N/A";
        const dueDate = b.dueDate ? dayjs(b.dueDate).format("YYYY-MM-DD") : "N/A";
        const key = b.borrowingCode || `${borrowDate}_${dueDate}`;

        if (!groupsMap.has(key)) {
          groupsMap.set(key, {
            key,
            borrowingCode: b.borrowingCode,
            borrowDate: b.borrowDate,
            dueDate: b.dueDate,
            items: [],
          });
        }
        const group = groupsMap.get(key);
        group.items.push(b);
      });

      const groups = Array.from(groupsMap.values()).map((g) => {
        const totalQuantity = g.items.reduce((sum, it) => sum + (it.quantity || 1), 0);
        let summaryStatus = "returned";
        if (g.items.some((it) => it.paymentStatus === "completed" || it.status === "compensated")) summaryStatus = "compensated";
        else if (g.items.some((it) => ["lost", "damaged"].includes(it.status))) summaryStatus = "damaged";
        else if (g.items.some((it) => it.status === "overdue")) summaryStatus = "overdue";
        else if (g.items.some((it) => ["borrowed", "renewed", "pendingPickup"].includes(it.status)))
          summaryStatus = "borrowed";

        const hasPendingPickup = g.items.some(
          (it) => !it.isPickedUp || it.status === "pendingPickup"
        );
        const hasPickedUpBorrowed = g.items.some(
          (it) =>
            it.isPickedUp &&
            ["borrowed", "renewed", "overdue"].includes(it.status)
        );
        const totalCompensation = g.items.reduce((sum, it) => {
          if (it.compensationAmount && it.compensationAmount > 0) {
            return sum + it.compensationAmount;
          }
          // Nếu không có tiền đền bù nhưng đang quá hạn thì tính phí quá hạn
          const fee = calculateOverdueFee(it);
          return sum + fee;
        }, 0);
        const processedItems = g.items.map((it) => {
          if (it.status === "overdue" && !it.compensationAmount) {
            return {
              ...it,
              compensationAmount: calculateOverdueFee(it),
            };
          }
          return it;
        });

        return {
          ...g,
          items: processedItems,
          totalQuantity,
          summaryStatus,
          totalCompensation,
          hasPendingPickup,
          hasPickedUpBorrowed,
        };
      });

      // Sắp xếp đơn lớn theo ngày mượn mới nhất
      groups.sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate));

      setHistory(mapped);
      setGroupedHistory(groups);
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
            `http://localhost:5000/api/borrowings/${id}/report-lost`,
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
            `http://localhost:5000/api/borrowings/${record._id}/report-broken`,
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
    if (["borrowed", "overdue"].includes(record.status) && now > due) {
      const diffDays = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
      return diffDays * OVERDUE_FEE_PER_DAY;
    }
    return 0;
  };

  // Cột cho bảng "đơn lớn" (đã gộp)
  const groupedColumns = [
    {
      title: "Mã đơn mượn",
      dataIndex: "borrowingCode",
      key: "borrowingCode",
      render: (code) => (
        <Tooltip title={code || "Chưa có mã đơn"}>
          <Tag color={code ? "cyan" : "default"} icon="🔖">
            {code ? code : "—"}
          </Tag>
        </Tooltip>
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
      title: "Số sách trong đơn",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      render: (q) => (
        <span className="font-semibold text-blue-600">
          {q} quyển
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "summaryStatus",
      key: "summaryStatus",
      render: (_, record) => {
        // Nếu trong đơn có cả sách đã lấy và sách chưa lấy -> hiển thị rõ là trạng thái hỗn hợp
        if (record.hasPendingPickup && record.hasPickedUpBorrowed) {
          return (
            <Tag color="blue">
              Đang mượn &amp; Chưa lấy sách
            </Tag>
          );
        }

        const status = record.summaryStatus;
        return (
          <Tag color={STATUS_COLOR[status] || "default"}>
            {STATUS_LABEL[status] || status}
          </Tag>
        );
      },
    },
    {
      title: "Tổng tiền (quá hạn / đền bù)",
      dataIndex: "totalCompensation",
      key: "totalCompensation",
      render: (total) =>
        total > 0 ? (
          <span style={{ color: "red", fontWeight: 600 }}>
            {total.toLocaleString("vi-VN")} VNĐ
          </span>
        ) : (
          "—"
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() =>
            navigate(`/history/${encodeURIComponent(record.borrowingCode || record.key)}`, {
              state: { group: record },
            })
          }
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  // Cột cho bảng chi tiết (đơn nhỏ trong 1 đơn lớn)
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
      title: "Mã đơn mượn",
      dataIndex: "borrowingCode",
      key: "borrowingCode",
      render: (code) => (
        <Tooltip title={code || "Chưa có mã đơn"}>
          <Tag color={code ? "cyan" : "default"} icon="🔖">
            {code ? code : "—"}
          </Tag>
        </Tooltip>
      ),
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
        // If payment already completed for this record, show compensated status instead
        if (record.paymentStatus === "completed") {
          displayStatus = "compensated";
        }

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
          <Button type="link" onClick={() => Modal.info({
            title: "Chi tiết sách mượn",
            content: (
              <div>
                <p>{record.book?.title || record.bookSnapshot?.title}</p>
                <p>Trạng thái: {STATUS_LABEL[record.paymentStatus === "completed" ? "compensated" : (!record.isPickedUp ? "pendingPickup" : (record.status === "borrowed" && new Date(record.dueDate) < new Date() ? "overdue" : record.status))]}</p>
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

          {["damaged", "lost", "overdue"].includes(record.status) && record.compensationAmount > 0 && record.paymentStatus !== "completed" && (
            <Button type="primary" icon={<DollarOutlined />} onClick={() => navigate(`/payment/${record._id}`)}>
              Thanh toán
            </Button>
          )}
          {record.status === "overdue" && 
            calculateOverdueFee(record) > 0 && 
            record.paymentStatus !== "completed" && (
              <Button type="primary" style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }} icon={<DollarOutlined />} onClick={() => navigate(`/payment/${record._id}`)}>
                Thanh toán phí quá hạn ({calculateOverdueFee(record).toLocaleString("vi-VN")} VNĐ)
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
          <span role="img" aria-label="history">
            📖
          </span>
          <span>Lịch sử mượn sách</span>
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
        <Table
          rowKey={(r) => r.key}
          columns={groupedColumns}
          dataSource={groupedHistory}
          loading={loading}
          pagination={{ pageSize: 5 }}
          bordered
        />
      </div>
    </div>
  );
};

export default History;

