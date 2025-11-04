<<<<<<< HEAD
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

const History = ({ userId }) => {
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

  useEffect(() => { fetchHistory(); }, [userId]);

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
      dataIndex: "user",
      key: "user",
      render: (user) => (user?.studentId || "000000") + " - " + (user?.fullName || "Khách vãng lai"),
    },
    {
      title: "Sách mượn",
      dataIndex: "book",
      key: "book",
      render: (book) => (
        <Space>
          <Image src={book?.image} width={40} height={60} />
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
      dataIndex: "returnDate",
      key: "returnDate",
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
                  <p>Tên sách: {record.book?.title}</p>
                  <p>Tác giả: {record.book?.author}</p>
                  <p>Ngày mượn: {new Date(record.borrowDate).toLocaleDateString("vi-VN")}</p>
                  <p>Ngày trả: {new Date(record.returnDate).toLocaleDateString("vi-VN")}</p>
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
=======
import { useEffect, useState } from "react";
import axios from "axios";
import { Eye, ShoppingCart, BookOpen, AlertTriangle, CreditCard } from "lucide-react";

const statusColors = {
  in_cart: "bg-yellow-100 text-yellow-700",
  borrowed: "bg-blue-100 text-blue-700",
  damaged: "bg-red-100 text-red-700",
  late: "bg-orange-100 text-orange-700",
};

const statusLabels = {
  in_cart: "Trong giỏ hàng",
  borrowed: "Đã mượn",
  damaged: "Bị hỏng/mất",
  late: "Trễ hẹn trả",
};

const History = () => {
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      fetchHistory(parsed.id);
    }
  }, []);

  const fetchHistory = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/history/${userId}`);
      setHistory(res.data);
    } catch (error) {
      console.error("Lỗi khi tải lịch sử:", error);
    }
  };

  const handleViewCart = () => {
    window.location.href = "/cart";
  };

  const handleBookDetail = (bookTitle) => {
    alert(`Xem chi tiết sách: ${bookTitle}`);
  };

  const handleReportDamage = (bookTitle) => {
    alert(`Đã báo mất/hỏng cho sách: ${bookTitle}`);
  };

  const handlePayment = (bookTitle) => {
    alert(`Thanh toán phí cho sách: ${bookTitle}`);
  };

  return (
    <div className="p-6 font-sans">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        📚 Lịch sử mượn sách
      </h2>

      {user && (
        <div className="mb-4 text-gray-700">
          <p><strong>Tên sinh viên:</strong> {user.name || "Không rõ"}</p>
          <p><strong>Mã sinh viên:</strong> {user.studentCode}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-xl">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-3 px-4 border-b text-left">#</th>
              <th className="py-3 px-4 border-b text-left">Tên sinh viên</th>
              <th className="py-3 px-4 border-b text-left">Mã sinh viên</th>
              <th className="py-3 px-4 border-b text-left">Sách</th>
              <th className="py-3 px-4 border-b text-left">Trạng thái</th>
              <th className="py-3 px-4 border-b text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {history.length > 0 ? (
              history.map((item, index) => (
                <tr key={item._id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4 border-b">{index + 1}</td>
                  <td className="py-3 px-4 border-b">{item.studentName}</td>
                  <td className="py-3 px-4 border-b">{item.studentCode}</td>
                  <td className="py-3 px-4 border-b">{item.bookTitle}</td>
                  <td className="py-3 px-4 border-b">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        statusColors[item.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {statusLabels[item.status] || "Không rõ"}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b flex flex-wrap gap-2">
                    <button
                      onClick={handleViewCart}
                      className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-yellow-600 transition"
                    >
                      <ShoppingCart size={14} /> Giỏ
                    </button>
                    <button
                      onClick={() => handleBookDetail(item.bookTitle)}
                      className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition"
                    >
                      <BookOpen size={14} /> Chi tiết
                    </button>
                    <button
                      onClick={() => handleReportDamage(item.bookTitle)}
                      className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition"
                    >
                      <AlertTriangle size={14} /> Báo hỏng
                    </button>
                    <button
                      onClick={() => handlePayment(item.bookTitle)}
                      className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition"
                    >
                      <CreditCard size={14} /> Thanh toán
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-6 text-gray-500 italic"
                >
                  Không có lịch sử mượn sách nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
>>>>>>> origin/main
    </div>
  );
};

export default History;
