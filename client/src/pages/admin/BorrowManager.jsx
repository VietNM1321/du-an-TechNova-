import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Tag, Button, Space, Modal, Input, message } from "antd";
import { BookOutlined, ExclamationCircleOutlined, DollarOutlined } from "@ant-design/icons";

const { confirm } = Modal;

const BorrowManager = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [compensationModal, setCompensationModal] = useState({ open: false, record: null });
  const [compensationAmount, setCompensationAmount] = useState("");

  const token = localStorage.getItem("adminToken");

  // 📦 Load danh sách đơn mượn
  const fetchBorrowings = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/borrowings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBorrowings(res.data);
    } catch (error) {
      console.error("❌ Lỗi tải borrowings:", error);
      message.error("Không tải được danh sách đơn mượn!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, []);

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

  // 💰 Nhập tiền đền
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
      message.success("Đã nhập tiền đền!");
      setBorrowings((prev) =>
        prev.map((b) =>
          b._id === compensationModal.record._id
            ? { ...b, compensationAmount, status: "compensated" }
            : b
        )
      );
      setCompensationModal({ open: false, record: null });
      setCompensationAmount("");
    } catch (error) {
      console.error(error);
      message.error("Không nhập được tiền đền!");
    }
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
      render: (status) => {
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
            text = "Đã nhập tiền đền";
            break;
          default:
            text = status;
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Ảnh đền tiền",
      key: "damageImage",
      render: (record) => {
        if (!record.damageImage) return "—";
        const src = record.damageImage.startsWith("http")
          ? record.damageImage
          : `http://localhost:5000/${record.damageImage}`;
        return (
          <img
            src={src}
            alt="ảnh đền tiền"
            style={{ width: 40, height: 60, objectFit: "cover", borderRadius: 4 }}
          />
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (record) => (
        <Space>
          {record.status === "borrowed" && (
            <Button type="primary" onClick={() => handleReturn(record)}>
              Xác nhận trả
            </Button>
          )}
          {(record.status === "damaged" || record.status === "lost") && (
            <Button
              type="dashed"
              danger
              icon={<DollarOutlined />}
              onClick={() => setCompensationModal({ open: true, record })}
            >
              Nhập tiền đền
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
        <Button onClick={fetchBorrowings}>Làm mới</Button>
      </div>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={borrowings}
        loading={loading}
        pagination={{ pageSize: 8 }}
      />

      {/* Modal Nhập tiền đền có preview ảnh */}
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

        {/* Preview ảnh hỏng/mất */}
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
