import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Button, Divider, Tag, Spin, message, Modal, Space, Table } from "antd";
import {ArrowLeftOutlined,ExclamationCircleOutlined,BookOutlined,} from "@ant-design/icons";
import dayjs from "dayjs";
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
const STATUS_COLORS = {
  [STATUS_ENUM.PENDING_PICKUP]: "blue",
  [STATUS_ENUM.BORROWED]: "green",
  [STATUS_ENUM.RETURNED]: "cyan",
  [STATUS_ENUM.RENEWED]: "purple",
  [STATUS_ENUM.OVERDUE]: "orange",
  [STATUS_ENUM.DAMAGED]: "red",
  [STATUS_ENUM.LOST]: "red",
  [STATUS_ENUM.COMPENSATED]: "gold",
};
const STATUS_LABELS = {
  [STATUS_ENUM.PENDING_PICKUP]: "Chờ lấy sách",
  [STATUS_ENUM.BORROWED]: "Đã mượn",
  [STATUS_ENUM.RETURNED]: "Đã trả",
  [STATUS_ENUM.RENEWED]: "Đã gia hạn",
  [STATUS_ENUM.OVERDUE]: "Quá hạn",
  [STATUS_ENUM.DAMAGED]: "Báo hỏng",
  [STATUS_ENUM.LOST]: "Báo mất",
  [STATUS_ENUM.COMPENSATED]: "Đã bồi thường",
};
const STATUS_COLORS_DISPLAY = {
  [STATUS_ENUM.PENDING_PICKUP]: "blue",
  [STATUS_ENUM.BORROWED]: "green",
  [STATUS_ENUM.RETURNED]: "green",
  [STATUS_ENUM.RENEWED]: "purple",
  [STATUS_ENUM.OVERDUE]: "orange",
  [STATUS_ENUM.DAMAGED]: "red",
  [STATUS_ENUM.LOST]: "red",
  [STATUS_ENUM.COMPENSATED]: "gold",
};
const BorrowingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [borrowing, setBorrowing] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("adminToken");
  useEffect(() => {
    fetchBorrowingDetail();
  }, [id]);
  const fetchBorrowingDetail = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/borrowings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBorrowing(res.data || res.data?.borrowing);
    } catch (error) {
      console.error(error);
      message.error("Không tải được chi tiết đơn mượn!");
      setTimeout(() => navigate("/admin/borrowings"), 2000);
    } finally {
      setLoading(false);
    }
  };
  const handleReturn = () => {
    Modal.confirm({
      title: "Xác nhận trả sách?",
      icon: <ExclamationCircleOutlined />,
      okText: "Có",
      cancelText: "Không",
      onOk: async () => {
        try {
          const res = await axios.put(`http://localhost:5000/api/borrowings/${id}/return`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          message.success(res.data?.message || "✅ Đã ghi nhận trả sách!");
          fetchBorrowingDetail();
        } catch (error) {
          message.error(
            error.response?.data?.message || "Lỗi khi ghi nhận trả sách!"
          );
        }
      },
    });
  };
  const handleRenew = () => {
    Modal.confirm({
      title: "Gia hạn mượn sách?",
      icon: <ExclamationCircleOutlined />,
      okText: "Có",
      cancelText: "Không",
      onOk: async () => {
        try {
          const res = await axios.put(`http://localhost:5000/api/borrowings/${id}/renew`,{},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          message.success(res.data?.message || "✅ Đã gia hạn!");
          fetchBorrowingDetail();
        } catch (error) {
          message.error(
            error.response?.data?.message || "Lỗi khi gia hạn mượn!"
          );
        }
      },
    });
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl px-10 py-8 flex flex-col items-center gap-4">
          <Spin size="large" />
          <p className="text-slate-600 font-medium">Đang tải chi tiết đơn mượn...</p>
        </div>
      </div>
    );
  }

  if (!borrowing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl px-10 py-8 text-center space-y-3">
          <p className="text-red-500 font-semibold text-lg">
            Không tìm thấy đơn mượn!
          </p>
          <Button type="primary" onClick={() => navigate("/admin/borrowings")}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }
  const isOverdue =
    borrowing.status === STATUS_ENUM.OVERDUE ||
    (new Date(borrowing.dueDate) < new Date() &&
      borrowing.status === STATUS_ENUM.BORROWED);
  const userName = borrowing.userSnapshot?.fullName || borrowing.user?.fullName || "N/A";
  const userEmail = borrowing.userSnapshot?.email || borrowing.user?.email || "";
  const bookTitle = borrowing.bookSnapshot?.title || borrowing.book?.title || "N/A";
  const bookAuthor = borrowing.bookSnapshot?.author || borrowing.book?.author || "N/A";
  const bookImage = borrowing.book?.image || borrowing.book?.images?.[0] || null;
  const bookImageUrl = bookImage 
    ? (bookImage.startsWith("http") ? bookImage : `http://localhost:5000/${bookImage}`)
    : "https://via.placeholder.com/60x80?text=?";
  const imgStudentUrl = borrowing.imgStudent 
    ? `http://localhost:5000/${borrowing.imgStudent}`
    : null;
  const imgCardUrl = borrowing.imgCard 
    ? `http://localhost:5000/${borrowing.imgCard}`
    : null;
  const isDamagedOrLost =
    borrowing.status === STATUS_ENUM.DAMAGED ||
    borrowing.status === STATUS_ENUM.LOST;
  const totalAmount = isDamagedOrLost ? borrowing.compensationAmount || 50000 : 0;
  const getStatusDisplay = (status) => {
    if (status === STATUS_ENUM.DAMAGED || status === STATUS_ENUM.LOST) {
      return "Hỏng / Mất";
    }
    return STATUS_LABELS[status] || status;
  };

  const getStatusColor = (status) => {
    if (status === STATUS_ENUM.DAMAGED || status === STATUS_ENUM.LOST) {
      return "red";
    }
    return STATUS_COLORS_DISPLAY[status] || STATUS_COLORS[status] || "default";
  };
  const tableData = [
    {
      key: borrowing._id,
      code: borrowing.borrowingCode || borrowing._id,
      borrower: {
        name: userName,
        email: userEmail,
      },
      book: {
        image: bookImageUrl,
        title: bookTitle,
        author: bookAuthor,
      },
      confirmImages: {
        student: imgStudentUrl,
        card: imgCardUrl,
      },
      quantity: borrowing.quantity || 1,
      renewCount: borrowing.renewCount || 0,
      borrowDate: borrowing.borrowDate,
      dueDate: borrowing.dueDate,
      returnDate: borrowing.returnDate,
      status: borrowing.status,
      compensation: totalAmount,
    },
  ];
  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "code",
      key: "code",
      width: 150,
      render: (code) => (
        <span className="font-mono font-semibold text-blue-600">{code}</span>
      ),
    },
    {
      title: "Người mượn",
      key: "borrower",
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-900">{record.borrower.name}</div>
          <div className="text-sm text-slate-500">{record.borrower.email}</div>
        </div>
      ),
    },
    {
      title: "Sách",
      key: "book",
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <img
            src={record.book.image}
            alt={record.book.title}
            className="w-12 h-16 object-cover rounded"
          />
          <div>
            <div className="font-medium text-slate-900">{record.book.title}</div>
            <div className="text-sm text-slate-500">Tác giả: {record.book.author}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Ảnh xác nhận",
      key: "confirmImages",
      width: 150,
      render: (_, record) => (
        <div className="flex gap-2">
          {record.confirmImages.student && (
            <img
              src={record.confirmImages.student}
              alt="Ảnh học sinh"
              className="w-12 h-16 object-cover rounded"
            />
          )}
          {record.confirmImages.card && (
            <img
              src={record.confirmImages.card}
              alt="Ảnh CMND/CCCD"
              className="w-12 h-16 object-cover rounded"
            />
          )}
          {!record.confirmImages.student && !record.confirmImages.card && (
            <span className="text-slate-400">—</span>
          )}
        </div>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      render: (qty) => (
        <span className="text-blue-600 font-semibold">{qty} quyển</span>
      ),
    },
    {
      title: "Lần gia hạn",
      dataIndex: "renewCount",
      key: "renewCount",
      width: 100,
      render: (count) => <span>{count}</span>,
    },
    {
      title: "Ngày mượn",
      dataIndex: "borrowDate",
      key: "borrowDate",
      width: 120,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày hẹn trả",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 120,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày trả",
      dataIndex: "returnDate",
      key: "returnDate",
      width: 120,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "—"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status) => (
        <Tag color={getStatusColor(status)} className="rounded">
          {getStatusDisplay(status)}
        </Tag>
      ),
    },
    {
      title: "Tiền đền / Phạt",
      dataIndex: "compensation",
      key: "compensation",
      width: 150,
      render: (amount) => (
        <span className="text-red-600 font-semibold">
          {amount > 0 ? `${amount.toLocaleString("vi-VN")} VNĐ` : "0 đ"}
        </span>
      ),
    },
  ];
  return (
    <div className="min-h-screen bg-white py-6 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <BookOutlined className="text-3xl text-blue-600" />
              <h1 className="text-3xl font-bold text-blue-600">Chi tiết đơn mượn</h1>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Tag color={STATUS_COLORS[borrowing.status]} className="text-sm px-3 py-1">
                {STATUS_LABELS[borrowing.status]}
              </Tag>
              {totalAmount > 0 && (
                <div className="text-right">
                  <span className="text-red-600 font-semibold text-lg">
                    ₫ Tổng tiền: {totalAmount.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-200">
            <div>
              <p className="text-sm text-slate-600 mb-1">Mã đơn:</p>
              <p className="font-semibold text-blue-600">
                {borrowing.borrowingCode || borrowing._id}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Ngày mượn:</p>
              <p className="font-semibold">{dayjs(borrowing.borrowDate).format("DD/MM/YYYY")}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Ngày trả:</p>
              <p className="font-semibold">
                {borrowing.returnDate 
                  ? dayjs(borrowing.returnDate).format("DD/MM/YYYY")
                  : dayjs(borrowing.dueDate).format("DD/MM/YYYY")}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Tổng số sách:</p>
              <p className="font-semibold text-blue-600">
                {borrowing.quantity || 1} quyển
              </p>
            </div>
          </div>
        </div>
        <Card
          className="rounded-lg shadow-sm border border-slate-200"
          bodyStyle={{ padding: 0 }}>
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Chi tiết đơn mượn</h2>
          </div>
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              dataSource={tableData}
              pagination={false}
              scroll={{ x: 1400 }}
              className="ant-table-custom"
            />
          </div>
        </Card>
        <div className="flex justify-start">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/borrowings")}
            className="text-slate-600 hover:text-slate-900"
          >
            Quay lại lịch sử
          </Button>
        </div>
      </div>
    </div>
  );
};
export default BorrowingDetail;