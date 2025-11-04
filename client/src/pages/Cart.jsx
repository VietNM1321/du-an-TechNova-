import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, InputNumber, message, Space, Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const Cart = () => {
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const userId = "anon"; // 👈 nếu có đăng nhập thì thay bằng user thật

  // 🧭 Lấy dữ liệu giỏ hàng
  const fetchCart = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/cart", {
        params: { userId },
      });
      const items = res.data?.items || [];
      const mapped = items.map((item) => ({
        ...item,
        borrowDate: item.borrowDate || new Date().toISOString(),
        returnDate:
          item.returnDate ||
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }));
      setCart(mapped);
    } catch (err) {
      console.error("❌ Lỗi fetch cart:", err);
      message.error("Không thể tải giỏ hàng!");
      setCart([]);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // ⚙️ Thay đổi số lượng sách
  const handleQuantityChange = (bookId, value) => {
    setCart((prev) =>
      prev.map((item) =>
        item.bookId._id === bookId ? { ...item, quantity: value } : item
      )
    );
  };

  // 🧾 Cột hiển thị bảng
  const columns = [
    {
      title: "Tên sách",
      dataIndex: "bookId",
      key: "title",
      render: (book) => book?.title || "—",
    },
    {
      title: "Tác giả",
      dataIndex: "bookId",
      key: "author",
      render: (book) => book?.author || "—",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (text, record) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(val) => handleQuantityChange(record.bookId._id, val)}
        />
      ),
    },
    {
      title: "Ngày mượn",
      dataIndex: "borrowDate",
      key: "borrowDate",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "—",
    },
    {
      title: "Ngày trả",
      dataIndex: "returnDate",
      key: "returnDate",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "—",
    },
  ];

  // 📦 Xác nhận mượn
  const handleBorrow = async () => {
    if (!cart || cart.length === 0) {
      message.warning("Giỏ sách đang trống!");
      return;
    }

    Modal.confirm({
      title: "Xác nhận mượn sách",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc chắn muốn mượn những sách này không?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      async onOk() {
        try {
          setLoading(true);

          // 🔹 Payload mới phù hợp schema backend
          const payload = {
            userId, // backend dùng để lấy user hoặc anon
            items: cart.map((item) => ({
              bookId: item.bookId._id,
              borrowDate: item.borrowDate,
              returnDate: item.returnDate,
            })),
          };

          // ✅ Gửi đơn mượn sang backend
          await axios.post("http://localhost:5000/api/borrowings", payload);

          // ✅ Xóa giỏ hàng
          await axios.delete("http://localhost:5000/api/cart/clear", {
            data: { userId },
          });

          setCart([]);
          message.success("✅ Mượn sách thành công!");
        } catch (error) {
          console.error("❌ Borrow error:", error.response?.data || error.message);
          message.error(error.response?.data?.message || "Không thể tạo đơn mượn!");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>📚 Giỏ sách mượn</h2>
      <Table
        rowKey={(record) => record.bookId?._id}
        columns={columns}
        dataSource={Array.isArray(cart) ? cart : []}
        pagination={false}
        bordered
      />
      <Space style={{ marginTop: 20 }}>
        <Button
          type="primary"
          onClick={handleBorrow}
          loading={loading}
          disabled={!cart || cart.length === 0}
        >
          Xác nhận mượn
        </Button>
      </Space>
    </div>
  );
};

export default Cart;
