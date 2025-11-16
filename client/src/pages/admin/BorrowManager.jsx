import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Input,
  message,
  Select,
  DatePicker,
} from "antd";
import dayjs from "dayjs";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { confirm } = Modal;

const BorrowManager = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [borrowFrom, setBorrowFrom] = useState(null);
  const [borrowTo, setBorrowTo] = useState(null);
  const [typingTimer, setTypingTimer] = useState(null);

  const token = localStorage.getItem("adminToken");

  const fetchBorrowings = async (pageNum = 1, params = {}) => {
    setLoading(true);
    try {
      const q = params.q ?? query;
      const l = params.limit ?? limit;
      const st = params.status ?? status;
      const bf = params.borrowFrom ?? borrowFrom;
      const bt = params.borrowTo ?? borrowTo;

      const parts = [
        `page=${pageNum}`,
        `limit=${l}`,
        q ? `q=${encodeURIComponent(q)}` : "",
        st ? `status=${encodeURIComponent(st)}` : "",
        bf ? `borrowFrom=${encodeURIComponent(bf)}` : "",
        bt ? `borrowTo=${encodeURIComponent(bt)}` : "",
      ].filter(Boolean);

      const res = await axios.get(
        `http://localhost:5000/api/borrowings?${parts.join("&")}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const payload = res.data || {};
      setBorrowings(payload.borrowings || []);
      setTotalItems(payload.totalItems || 0);
      setPage(payload.currentPage || pageNum);
    } catch (error) {
      console.error(error);
      message.error("Không tải được danh sách đơn mượn!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowings(page);
  }, [page, limit, status, borrowFrom, borrowTo]);

  const onChangeQuery = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (typingTimer) clearTimeout(typingTimer);
    const timer = setTimeout(() => {
      setPage(1);
      fetchBorrowings(1, { q: value });
    }, 400);
    setTypingTimer(timer);
  };

  // Xác nhận đã lấy sách
  const handleConfirmPickup = (record) => {
    confirm({
      title: "Xác nhận đã lấy sách?",
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          const res = await axios.put(
            `http://localhost:5000/api/borrowings/${record._id}/pickup`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          message.success(res.data.message || "✅ Đã xác nhận lấy sách!");
          setBorrowings((prev) =>
            prev.map((b) =>
              b._id === record._id ? { ...b, isPickedUp: true } : b
            )
          );
        } catch (error) {
          console.error(error);
          message.error(
            error.response?.data?.message || "Lỗi khi xác nhận lấy sách!"
          );
        }
      },
    });
  };

  // Xác nhận trả sách
  const handleReturn = (record) => {
    confirm({
      title: "Xác nhận đã trả sách?",
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await axios.put(
            `http://localhost:5000/api/borrowings/${record._id}/return`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          message.success("Đã ghi nhận trả sách!");
          setBorrowings((prev) =>
            prev.map((b) =>
              b._id === record._id
                ? { ...b, hasReturned: true }
                : b
            )
          );
        } catch (error) {
          console.error(error);
          message.error("Lỗi khi ghi nhận trả sách!");
        }
      },
    });
  };

  // Xác nhận thanh toán
  const handleConfirmPayment = (record) => {
    if (!record.hasReturned) {
      message.warning("Phải trả sách trước khi thanh toán!");
      return;
    }
    confirm({
      title: "Xác nhận thanh toán?",
      content: `Xác nhận đã nhận thanh toán ${
        record.compensationAmount?.toLocaleString("vi-VN") || 0
      } VNĐ?`,
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await axios.put(
            `http://localhost:5000/api/borrowings/${record._id}/confirm-payment`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          message.success("✅ Đã thanh toán!");
          setBorrowings((prev) =>
            prev.map((b) =>
              b._id === record._id
                ? { ...b, status: "returned", paymentStatus: "done" }
                : b
            )
          );
        } catch (error) {
          console.error(error);
          message.error("Lỗi khi thanh toán!");
        }
      },
    });
  };

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "_id",
      key: "_id",
      render: (id) => id.slice(-10),
    },
    {
      title: "Người mượn",
      key: "user",
      width: "18%",
      render: (record) => {
        const user = record.user || record.userSnapshot || {};
        const name = user.fullName || "Khách vãng lai";
        const email = user.email || "";
        return (
          <div>
            <div>{name}</div>
            <div className="text-gray-500 text-sm">{email}</div>
          </div>
        );
      },
    },
    {
      title: "Sách",
      key: "book",
      width: "25%",
      render: (record) => {
        const book = record.book || record.bookSnapshot || {};
        const title = book.title || "Không rõ";
        const author = (book.author && book.author.name) || book.author || "N/A";
        let thumb = book.image || (book.images && book.images[0]) || null;
        if (thumb && !thumb.startsWith("http")) thumb = `http://localhost:5000/${thumb}`;
        const placeholder = "https://via.placeholder.com/40x60?text=?";
        return (
          <div className="flex items-center gap-2">
            <img
              src={thumb || placeholder}
              alt="cover"
              style={{ width: 40, height: 60, objectFit: "cover", borderRadius: 4 }}
            />
            <div>
              <div className="font-medium">{title}</div>
              <div className="text-gray-500 text-sm">Tác giả: {author}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: "10%",
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
      render: (date) => (date ? new Date(date).toLocaleDateString("vi-VN") : "—"),
    },
    {
      title: "Ngày hẹn trả",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date) => (date ? new Date(date).toLocaleDateString("vi-VN") : "—"),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (record) => {
        let text = "";
        let color = "default";
        switch (record.status) {
          case "borrowed":
            text = record.isPickedUp ? "Đang mượn" : "Chưa lấy sách";
            color = record.isPickedUp ? "cyan" : "blue";
            break;
          case "returned":
            text = "Đã trả";
            color = "green";
            break;
          case "overdue":
            text = record.hasReturned ? "Quá hạn (Đã trả vật lý)" : "Quá hạn";
            color = "orange";
            break;
          case "damaged":
          case "lost":
            text = "Hỏng / Mất";
            color = "red";
            break;
          case "compensated":
            text = "Đã thanh toán";
            color = "gold";
            break;
          default:
            text = "—";
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Tiền đền / Phạt",
      key: "compensation",
      render: (record) => {
        const compensation = record.compensationAmount || 0;
        return compensation > 0 ? (
          <div className="text-right font-semibold text-red-600">{compensation.toLocaleString("vi-VN")} VNĐ</div>
        ) : "—";
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (record) => (
        <Space size="small">
          {record.status === "borrowed" && !record.isPickedUp && (
            <Button
              size="small"
              type="primary"
              onClick={() => handleConfirmPickup(record)}
            >
              ✅ Xác nhận lấy sách
            </Button>
          )}

          {record.status === "borrowed" && record.isPickedUp && (
            <Button size="small" type="primary" onClick={() => handleReturn(record)}>
              ✅ Trả sách
            </Button>
          )}

          {record.status === "overdue" && (
            <>
              <Button size="small" type="primary" onClick={() => handleReturn(record)}>
                ✅ Trả sách
              </Button>
              <Button
                size="small"
                type="primary"
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                disabled={!record.hasReturned}
                onClick={() => handleConfirmPayment(record)}
              >
                ✅ Thanh toán
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Quản lý đơn mượn sách</h2>
          <Button onClick={() => fetchBorrowings(page)} className="!rounded-2xl !bg-blue-600 !text-white hover:!bg-blue-700">
            Làm mới
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 grid grid-cols-1 lg:grid-cols-4 gap-5">
          <Input
            value={query}
            onChange={onChangeQuery}
            placeholder="Tìm kiếm người mượn, sách..."
            className="rounded-2xl"
          />
          <Select
            value={status}
            onChange={(v) => { setStatus(v); setPage(1); }}
            allowClear
            placeholder="Trạng thái"
            options={[
              { value: "borrowed", label: "Đang mượn" },
              { value: "returned", label: "Đã trả" },
              { value: "overdue", label: "Quá hạn" },
              { value: "damaged", label: "Hỏng" },
              { value: "lost", label: "Mất" },
              { value: "compensated", label: "Đã thanh toán" },
            ]}
          />
          <DatePicker
            value={borrowFrom ? dayjs(borrowFrom) : null}
            onChange={(d) => { setBorrowFrom(d ? d.format("YYYY-MM-DD") : null); setPage(1); }}
            placeholder="Mượn từ"
          />
          <DatePicker
            value={borrowTo ? dayjs(borrowTo) : null}
            onChange={(d) => { setBorrowTo(d ? d.format("YYYY-MM-DD") : null); setPage(1); }}
            placeholder="Mượn đến"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-4 overflow-x-auto">
          <Table
            columns={columns}
            dataSource={borrowings}
            loading={loading}
            rowKey="_id"
            pagination={{
              current: page,
              pageSize: limit,
              total: totalItems,
              showSizeChanger: true,
              onChange: (p, l) => { setPage(p); setLimit(l); },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BorrowManager;
