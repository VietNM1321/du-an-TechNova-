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
  Upload,
} from "antd";
import dayjs from "dayjs";
import { ExclamationCircleOutlined, UploadOutlined } from "@ant-design/icons";

const { confirm } = Modal;

const STATUS_ENUM = {
  BORROWED: "borrowed",
  RETURNED: "returned",
  OVERDUE: "overdue",
  DAMAGED: "damaged",
  LOST: "lost",
  COMPENSATED: "compensated",
  RENEWED: "renewed",
  PENDING_PICKUP: "pendingPickup",
};

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

  // Modal upload ảnh
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [imgStudent, setImgStudent] = useState(null);
  const [imgCard, setImgCard] = useState(null);
  const [previewStudent, setPreviewStudent] = useState(null);
  const [previewCard, setPreviewCard] = useState(null);

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
      const mappedBorrowings = (payload.borrowings || []).map((b) => ({
        ...b,
        status: b.status || STATUS_ENUM.BORROWED,
        isPickedUp: b.isPickedUp ?? false,
        hasReturned: b.status === STATUS_ENUM.RETURNED,
        imgStudent: b.imgStudent || null,
        imgCard: b.imgCard || null,
      }));

      setBorrowings(mappedBorrowings);
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
            b._id === record._id
              ? { ...b, isPickedUp: true, status: STATUS_ENUM.BORROWED }
              : b
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
  // ===== Modal xác nhận lấy sách =====
  const openPickupModal = (record) => {
    setSelectedRecord(record);
    setImgStudent(null);
    setImgCard(null);
    setPreviewStudent(null);
    setPreviewCard(null);
    setModalVisible(true);
  };

  const handlePickupConfirm = async () => {
    if (!imgStudent || !imgCard) {
      message.error("Vui lòng upload đủ 2 ảnh!");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("imgStudent", imgStudent);
      formData.append("imgCard", imgCard);

      const res = await axios.put(
        `http://localhost:5000/api/borrowings/${selectedRecord._id}/pickup`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { imgStudent: sUrl, imgCard: cUrl } = res.data;

      message.success(res.data.message || "✅ Đã xác nhận lấy sách!");

      setBorrowings((prev) =>
        prev.map((b) =>
          b._id === selectedRecord._id
            ? {
                ...b,
                isPickedUp: true,
                status: STATUS_ENUM.BORROWED,
                imgStudent: sUrl,
                imgCard: cUrl,
              }
            : b
        )
      );
      setModalVisible(false);
    } catch (error) {
      console.error(error);
      message.error(
        error.response?.data?.message || "Lỗi khi xác nhận lấy sách!"
      );
    }
  };

  // ===== Xử lý trả sách hoặc đổi trạng thái =====
  const handleReturnOrStatusChange = (record, newStatus) => {
    confirm({
      title: "Xác nhận?",
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          const res = await axios.put(
            `http://localhost:5000/api/borrowings/${record._id}/return`,
            {},
          const url =
            newStatus === STATUS_ENUM.RETURNED
              ? `http://localhost:5000/api/borrowings/${record._id}/return`
              : `http://localhost:5000/api/borrowings/${record._id}/status`;
          await axios.put(
            url,
            { status: newStatus },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          message.success("✅ Cập nhật trạng thái thành công!");
          setBorrowings((prev) =>
            prev.map((b) =>
              b._id === record._id
                ? {
                    ...b,
                    status: newStatus,
                    hasReturned: newStatus === STATUS_ENUM.RETURNED,
                  }
                : b
            )
          );
        } catch (error) {
          console.error(error);
          message.error("Lỗi khi cập nhật trạng thái!");
        }
      },
    });
  };

  const handleConfirmPayment = (record) => {
    confirm({
      title: "Xác nhận thanh toán?",
      content: `Xác nhận đã nhận thanh toán ${
        record.compensationAmount?.toLocaleString("vi-VN") || 0
      } VNĐ?`,
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          const res = await axios.put(
            `http://localhost:5001/api/borrowings/${record._id}/confirm-payment`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          message.success(res.data?.message || "✅ Đã thanh toán!");
          setBorrowings((prev) =>
            prev.map((b) =>
              b._id === record._id
                ? {
                    ...b,
                    status: STATUS_ENUM.COMPENSATED,
                    paymentStatus: "completed",
                  }
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
        if (thumb && !thumb.startsWith("http"))
          thumb = `http://localhost:5000/${thumb}`;
        const placeholder = "https://via.placeholder.com/40x60?text=?";
        return (
          <div className="flex items-center gap-2">
            <img
              src={thumb || placeholder}
              alt="cover"
              style={{
                width: 40,
                height: 60,
                objectFit: "cover",
                borderRadius: 4,
              }}
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
      title: "Ảnh xác nhận",
      key: "images",
      render: (record) => (
        <div className="flex gap-2">
          {record.imgStudent && (
            <img
              src={`http://localhost:5000/${record.imgStudent}`}
              alt="Student"
              width={60}
            />
          )}
          {record.imgCard && (
            <img
              src={`http://localhost:5000/${record.imgCard}`}
              alt="Card"
              width={60}
            />
          )}
        </div>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: "10%",
      render: (quantity) => (
        <span className="font-semibold text-blue-600">{quantity || 1} quyển</span>
      ),
    },
    {
      title: "Lần gia hạn",
      dataIndex: "renewCount",
      key: "renewCount",
      render: (renewCount) => (
        <span>
          {renewCount || 0}
          {renewCount >= 3 && (
            <span className="ml-2 text-xs text-red-500">(Đã hết lượt gia hạn)</span>
          )}
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
        let text = "Chưa lấy sách";
        let color = "blue";
        switch (record.status) {
          case STATUS_ENUM.BORROWED:
            text = record.isPickedUp ? "Đang mượn" : "Chưa lấy sách";
            color = record.isPickedUp ? "cyan" : "blue";
            break;
          case STATUS_ENUM.RENEWED:
            text = record.isPickedUp ? "Đã gia hạn" : "Chưa lấy sách";
            color = record.isPickedUp ? "cyan" : "blue";
            break;
          case STATUS_ENUM.RETURNED:
            text = "Đã trả";
            color = "green";
            break;
          case STATUS_ENUM.OVERDUE:
            text = record.hasReturned
              ? "Quá hạn (Đã trả vật lý)"
              : "Quá hạn";
            color = "orange";
            break;
          case STATUS_ENUM.DAMAGED:
          case STATUS_ENUM.LOST:
            text = "Hỏng / Mất";
            color = "red";
            break;
          case STATUS_ENUM.COMPENSATED:
            text = "Đã thanh toán";
            color = "gold";
            break;
          case STATUS_ENUM.PENDING_PICKUP:
            text = "Chưa lấy sách";
            color = "blue";
            break;
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
          <div className="text-right font-semibold text-red-600">
            {compensation.toLocaleString("vi-VN")} VNĐ
          </div>
        ) : (
          "—"
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (record) => (
        <Space size="small">
          {!record.isPickedUp &&
            record.status === STATUS_ENUM.PENDING_PICKUP && (
              <Button
                size="small"
                type="primary"
                onClick={() => openPickupModal(record)}
              >
                ✅ Xác nhận lấy sách
              </Button>
            )}
          {record.isPickedUp &&
            [STATUS_ENUM.BORROWED, STATUS_ENUM.RENEWED, STATUS_ENUM.OVERDUE].includes(
              record.status
            ) && (
              <Button
                size="small"
                type="primary"
                onClick={() =>
                  handleReturnOrStatusChange(record, STATUS_ENUM.RETURNED)
                }
              >
                ✅ Trả sách
              </Button>
            )}
          {["damaged", "lost", "overdue"].includes(record.status) &&
            record.compensationAmount > 0 &&
            record.paymentStatus !== "completed" && (
              <Button
                size="small"
                type="primary"
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                onClick={() => handleConfirmPayment(record)}
              >
                ✅ Xác nhận thanh toán
              </Button>
            )}
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Quản lý đơn mượn sách
          </h2>
          <Button
            onClick={() => fetchBorrowings(1)}
            className="!rounded-2xl !bg-blue-600 !text-white hover:!bg-blue-700"
          >
            Làm mới
          </Button>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 grid grid-cols-1 lg:grid-cols-4 gap-5">
          <Input
            value={query}
            onChange={onChangeQuery}
            placeholder="Tìm kiếm người mượn, sách..."
            className="rounded-2xl"
          />
          <Select
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            allowClear
            placeholder="Trạng thái"
            options={[
              { value: STATUS_ENUM.BORROWED, label: "Đang mượn" },
              { value: STATUS_ENUM.RENEWED, label: "Đã gia hạn" },
              { value: STATUS_ENUM.RETURNED, label: "Đã trả" },
              { value: STATUS_ENUM.OVERDUE, label: "Quá hạn" },
              { value: STATUS_ENUM.DAMAGED, label: "Hỏng" },
              { value: STATUS_ENUM.LOST, label: "Mất" },
              { value: STATUS_ENUM.COMPENSATED, label: "Đã thanh toán" },
              { value: STATUS_ENUM.PENDING_PICKUP, label: "Chưa lấy sách" },
            ]}
          />
          <DatePicker
            value={borrowFrom ? dayjs(borrowFrom) : null}
            onChange={(d) => {
              setBorrowFrom(d ? d.format("YYYY-MM-DD") : null);
              setPage(1);
            }}
            placeholder="Mượn từ"
          />
          <DatePicker
            value={borrowTo ? dayjs(borrowTo) : null}
            onChange={(d) => {
              setBorrowTo(d ? d.format("YYYY-MM-DD") : null);
              setPage(1);
            }}
            placeholder="Mượn đến"
          />
        </div>

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
              onChange: (p, l) => {
                setPage(p);
                setLimit(l);
              },
            }}
          />
        </div>

        {/* Modal upload xác nhận lấy sách */}
        <Modal
          title="Xác nhận đã lấy sách?"
          open={modalVisible}
          onOk={handlePickupConfirm}
          onCancel={() => setModalVisible(false)}
          okText="Xác nhận"
          cancelText="Hủy"
        >
          <div className="flex flex-col gap-4">
            <div>
              <Upload
                beforeUpload={(file) => {
                  setImgStudent(file);
                  const reader = new FileReader();
                  reader.onload = (e) => setPreviewStudent(e.target.result);
                  reader.readAsDataURL(file);
                  return false;
                }}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>Upload ảnh học sinh</Button>
              </Upload>
              {previewStudent && (
                <img
                  src={previewStudent}
                  alt="Student"
                  className="mt-2 w-32 h-40 object-cover rounded"
                />
              )}
            </div>

            <div>
              <Upload
                beforeUpload={(file) => {
                  setImgCard(file);
                  const reader = new FileReader();
                  reader.onload = (e) => setPreviewCard(e.target.result);
                  reader.readAsDataURL(file);
                  return false;
                }}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>Upload ảnh CMND/CCCD</Button>
              </Upload>
              {previewCard && (
                <img
                  src={previewCard}
                  alt="Card"
                  className="mt-2 w-32 h-40 object-cover rounded"
                />
              )}
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default BorrowManager;
