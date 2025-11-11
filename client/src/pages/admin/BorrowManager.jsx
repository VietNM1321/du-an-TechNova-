import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Tag, Button, Space, Modal, Input, message, Select, DatePicker } from "antd";
import dayjs from "dayjs";
import { BookOutlined, ExclamationCircleOutlined, DollarOutlined } from "@ant-design/icons";
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
  const [dueFrom, setDueFrom] = useState(null);
  const [dueTo, setDueTo] = useState(null);
  const [sort, setSort] = useState("borrowDate");
  const [order, setOrder] = useState("desc");
  const [typingTimer, setTypingTimer] = useState(null);
  const [compensationModal, setCompensationModal] = useState({ open: false, record: null });
  const [compensationAmount, setCompensationAmount] = useState("");

  const token = localStorage.getItem("adminToken");
  // 📦 Load danh sách đơn mượn
  const fetchBorrowings = async (pageNum = 1, params = {}) => {
    setLoading(true);
    try {
      const q = params.q ?? query;
      const s = params.sort ?? sort;
      const o = params.order ?? order;
      const l = params.limit ?? limit;
      const st = params.status ?? status;
      const bf = params.borrowFrom ?? borrowFrom;
      const bt = params.borrowTo ?? borrowTo;
      const df = params.dueFrom ?? dueFrom;
      const dt = params.dueTo ?? dueTo;

      const parts = [
        `page=${pageNum}`,
        `limit=${l}`,
        q ? `q=${encodeURIComponent(q)}` : "",
        st ? `status=${encodeURIComponent(st)}` : "",
        bf ? `borrowFrom=${encodeURIComponent(bf)}` : "",
        bt ? `borrowTo=${encodeURIComponent(bt)}` : "",
        df ? `dueFrom=${encodeURIComponent(df)}` : "",
        dt ? `dueTo=${encodeURIComponent(dt)}` : "",
        s ? `sort=${encodeURIComponent(s)}` : "",
        o ? `order=${encodeURIComponent(o)}` : "",
      ].filter(Boolean);

      const res = await axios.get(`http://localhost:5000/api/borrowings?${parts.join("&")}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = res.data || {};
      setBorrowings(payload.borrowings || []);
      setTotalItems(payload.totalItems || 0);
      setPage(payload.currentPage || pageNum);
    } catch (error) {
      console.error("❌ Lỗi tải borrowings:", error);
      message.error("Không tải được danh sách đơn mượn!");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchBorrowings(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, status, sort, order, borrowFrom, borrowTo, dueFrom, dueTo]);

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

  const onClearFilters = () => {
    setQuery("");
    setStatus("");
    setBorrowFrom(null);
    setBorrowTo(null);
    setDueFrom(null);
    setDueTo(null);
    setSort("borrowDate");
    setOrder("desc");
    setLimit(10);
    setPage(1);
    fetchBorrowings(1, { q: "" });
  };

  // ✅ Xác nhận trả sách
  const handleReturn = (record) => {
    confirm({
      title: "Xác nhận trả sách?",
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await axios.put(
            `http://localhost:5000/api/borrowings/${record._id}/return`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          message.success("Đã xác nhận trả!");
          setBorrowings((prev) =>
            prev.map((b) =>
              b._id === record._id ? { ...b, status: "returned", returnDate: new Date() } : b
            )
          );
        } catch (error) {
          console.error(error);
          message.error("Lỗi khi xác nhận trả!");
        }
      },
    });
  };
  // 💰 Nhập tiền đền (nếu cần thay đổi số tiền)
  const handleCompensation = async () => {
    if (!compensationAmount) {
      message.warning("Vui lòng nhập số tiền đền!");
      return;
    }
    try {
      await axios.put(
        `http://localhost:5000/api/borrowings/${compensationModal.record._id}/compensation`,
        { compensationAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("Đã cập nhật tiền đền!");
      fetchBorrowings(page);
      setCompensationModal({ open: false, record: null });
      setCompensationAmount("");
    } catch (error) {
      console.error(error);
      message.error("Không cập nhật được tiền đền!");
    }
  };

  // ✅ Xác nhận thanh toán (khi thanh toán qua ngân hàng)
  const handleConfirmPayment = (record) => {
    confirm({
      title: "Xác nhận thanh toán?",
      icon: <ExclamationCircleOutlined />,
      content: `Xác nhận đã nhận thanh toán ${record.compensationAmount?.toLocaleString("vi-VN") || 0} VNĐ từ người dùng?`,
      onOk: async () => {
        try {
          await axios.put(
            `http://localhost:5000/api/borrowings/${record._id}/confirm-payment`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          message.success("✅ Đã xác nhận thanh toán thành công!");
          fetchBorrowings(page);
        } catch (error) {
          console.error(error);
          message.error("Lỗi khi xác nhận thanh toán!");
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
      width: "22%",
      render: (record) => {
        const book = record.book || record.bookSnapshot || {};
        const title = book.title || "Không rõ";
        const author = (book.author && book.author.name) || book.author || "N/A";

        let thumb = null;
        if (book.image) thumb = book.image;
        else if (book.images && book.images.length > 0) thumb = book.images[0];

        if (thumb && !thumb.startsWith("http")) {
          thumb = `http://localhost:5000/${thumb}`;
        }
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
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        let color = "default";
        let text = "";
        switch (status) {
          case "borrowed":
            color = "blue";
            text = "Đang mượn";
            break;
          case "returned":
            color = "green";
            text = "Đã trả";
            break;
          case "damaged":
          case "lost":
            color = "red";
            text = "Hỏng / Mất";
            break;
          case "overdue":
            color = "orange";
            text = "Quá hạn";
            break;
          case "compensated":
            color = "purple";
            text = "Đã đền bù";
            break;
          default:
            text = status;
        }
        return (
          <div>
            <Tag color={color}>{text}</Tag>
            {record.paymentStatus && (
              <Tag
                color={
                  record.paymentStatus === "completed"
                    ? "green"
                    : record.paymentStatus === "paid"
                    ? "blue"
                    : "orange"
                }
                className="mt-1"
              >
                {record.paymentStatus === "completed"
                  ? "Đã thanh toán"
                  : record.paymentStatus === "paid"
                  ? "Đã thanh toán"
                  : record.paymentStatus === "pending"
                  ? "Chờ thanh toán"
                  : ""}
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: "Tiền đền",
      key: "compensation",
      render: (_, record) => {
        if (record.compensationAmount && record.compensationAmount > 0) {
          return (
            <div>
              <span className="font-semibold text-red-600">
                {record.compensationAmount.toLocaleString("vi-VN")} VNĐ
              </span>
              {record.paymentMethod && (
                <div className="text-xs text-gray-500 mt-1">
                  {record.paymentMethod === "cash" ? "💵 Tiền mặt" : "🏦 Ngân hàng"}
                </div>
              )}
            </div>
          );
        }
        return "—";
      },
    },
    {
      title: "Ảnh / QR Code",
      key: "images",
      render: (record) => {
        const images = [];
        if (record.damageImage) {
          const src = record.damageImage.startsWith("http")
            ? record.damageImage
            : `http://localhost:5000/${record.damageImage}`;
          images.push({ src, alt: "Ảnh hỏng", label: "Hỏng" });
        }
        if (record.qrCodeImage) {
          const src = record.qrCodeImage.startsWith("http")
            ? record.qrCodeImage
            : `http://localhost:5000/${record.qrCodeImage}`;
          images.push({ src, alt: "QR Code", label: "QR" });
        }
        if (images.length === 0) return "—";
        return (
          <div className="flex flex-col gap-1">
            {images.map((img, idx) => (
              <div key={idx}>
                <img
                  src={img.src}
                  alt={img.alt}
                  style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4, cursor: "pointer" }}
                  onClick={() => {
                    Modal.info({
                      title: img.label,
                      content: <img src={img.src} alt={img.alt} style={{ width: "100%", maxWidth: 400 }} />,
                      width: 500,
                    });
                  }}
                />
                <div className="text-xs text-gray-500">{img.label}</div>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (record) => (
        <Space direction="vertical" size="small">
          {record.status === "borrowed" && (
            <Button type="primary" onClick={() => handleReturn(record)}>
              Xác nhận trả
            </Button>
          )}
          {/* Xác nhận thanh toán khi thanh toán qua ngân hàng */}
          {(record.status === "damaged" || record.status === "lost") &&
           record.paymentStatus === "pending" &&
           record.paymentMethod === "bank" && (
            <Button
              type="primary"
              style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
              onClick={() => handleConfirmPayment(record)}
            >
              ✅ Xác nhận thanh toán
            </Button>
          )}
          {/* Hiển thị thông tin thanh toán đã hoàn tất */}
          {record.paymentStatus === "completed" && (
            <Tag color="green">Đã hoàn tất thanh toán</Tag>
          )}
          {/* Nút chỉnh sửa tiền đền (nếu cần) */}
          {(record.status === "damaged" || record.status === "lost") && (
            <Button
              type="dashed"
              size="small"
              icon={<DollarOutlined />}
              onClick={() => {
                setCompensationAmount(record.compensationAmount || "50000");
                setCompensationModal({ open: true, record });
              }}
            >
              Sửa tiền đền
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BookOutlined /> Quản lý đơn mượn sách
        </h2>
        <Button onClick={() => fetchBorrowings(page)}>Làm mới</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
          <Input
            value={query}
            onChange={onChangeQuery}
            placeholder="Tên/email người mượn, tên sách, ISBN..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
          <Select
            value={status}
            onChange={(v) => { setStatus(v); setPage(1); }}
            allowClear
            placeholder="Tất cả"
            options={[
              { value: "borrowed", label: "Đang mượn" },
              { value: "returned", label: "Đã trả" },
              { value: "overdue", label: "Quá hạn" },
              { value: "damaged", label: "Hỏng" },
              { value: "lost", label: "Mất" },
              { value: "compensated", label: "Đã nhập tiền đền" },
            ]}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mượn từ</label>
          <DatePicker
            value={borrowFrom ? dayjs(borrowFrom) : null}
            onChange={(d) => { setBorrowFrom(d ? d.format("YYYY-MM-DD") : null); setPage(1); }}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mượn đến</label>
          <DatePicker
            value={borrowTo ? dayjs(borrowTo) : null}
            onChange={(d) => { setBorrowTo(d ? d.format("YYYY-MM-DD") : null); setPage(1); }}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hẹn trả từ</label>
          <DatePicker
            value={dueFrom ? dayjs(dueFrom) : null}
            onChange={(d) => { setDueFrom(d ? d.format("YYYY-MM-DD") : null); setPage(1); }}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hẹn trả đến</label>
          <DatePicker
            value={dueTo ? dayjs(dueTo) : null}
            onChange={(d) => { setDueTo(d ? d.format("YYYY-MM-DD") : null); setPage(1); }}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sắp xếp theo</label>
          <Select
            value={sort}
            onChange={(v) => { setSort(v); setPage(1); }}
            options={[
              { value: "borrowDate", label: "Ngày mượn" },
              { value: "dueDate", label: "Hẹn trả" },
              { value: "status", label: "Trạng thái" },
              { value: "createdAt", label: "Ngày tạo" },
            ]}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự</label>
          <Select
            value={order}
            onChange={(v) => { setOrder(v); setPage(1); }}
            options={[
              { value: "desc", label: "Giảm dần" },
              { value: "asc", label: "Tăng dần" },
            ]}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mỗi trang</label>
          <Select
            value={limit}
            onChange={(v) => { setLimit(v); setPage(1); }}
            options={[
              { value: 10, label: "10" },
              { value: 20, label: "20" },
              { value: 50, label: "50" },
            ]}
            className="w-full"
          />
        </div>
        <div className="flex items-end">
          <Button onClick={onClearFilters}>Đặt lại</Button>
        </div>
      </div>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={borrowings}
        loading={loading}
        pagination={{
          current: page,
          pageSize: limit,
          total: totalItems,
          onChange: (p, ps) => {
            if (ps !== limit) {
              setLimit(ps);
              setPage(1);
            } else {
              setPage(p);
            }
          },
          showSizeChanger: true,
        }}
      />

      {/* Modal Nhập tiền đền có ảnh */}
      <Modal
        title="💰 Nhập tiền đền"
        open={compensationModal.open}
        onOk={handleCompensation}
        onCancel={() => setCompensationModal({ open: false, record: null })}
        okText="Lưu"
        cancelText="Hủy"
      >
        <p>
          Nhập số tiền đền cho đơn <b>{compensationModal.record?._id?.slice(-8)}</b>:
        </p>

        {/* ảnh hỏng/mất */}
        {compensationModal.record?.damageImage && (
          <div className="mb-2">
            <img
              src={
                compensationModal.record.damageImage.startsWith("http")
                  ? compensationModal.record.damageImage
                  : `http://localhost:5000/${compensationModal.record.damageImage}`
              }
              alt="ảnh đền tiền"
              style={{ width: 80, height: 120, objectFit: "cover", borderRadius: 4 }}
            />
          </div>
        )}

        <Input
          type="number"
          value={compensationAmount}
          onChange={(e) => setCompensationAmount(e.target.value)}
          placeholder="VD: 50000"
        />
      </Modal>
    </div>
  );
};

export default BorrowManager;
