import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, InputNumber, message, Space, Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const Cart = () => {
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState({ items: [] });
  const userId = "6900cbaa373bd68ade6b791a"; // user đăng nhập

  // 🔹 Fetch giỏ hàng
  const fetchCart = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/cart", {
        params: { userId },
      });
      const data = res.data || { items: [] };

      // ⚡ Hardcode test nếu chưa có item
      if (!data.items || data.items.length === 0) {
        data.items = [
          {
            _id: "test1",
            book: "68f36c3e8a23553d16b11289", // ✅ ObjectId hợp lệ
            quantity: 1,
            borrowDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            bookSnapshot: {
              title: "Thao túng tâm lý",
              author: { name: "Lê Hoài Phong" },
            },
          },
        ];
      }

      setCart(data);
      console.log("Cart fetched:", data);
    } catch (err) {
      console.error("❌ Lỗi fetch cart:", err);
      message.error("Không thể tải giỏ hàng!");
      setCart({
        items: [
          {
            _id: "test1",
            book: "68f36c3e8a23553d16b11289", // ✅ ObjectId hợp lệ
            quantity: 1,
            borrowDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            bookSnapshot: {
              title: "Thao túng tâm lý",
              author: { name: "Lê Hoài Phong" },
            },
          },
        ],
      });
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // 🔹 Thay đổi số lượng
  const handleQuantityChange = (_id, value) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item._id === _id ? { ...item, quantity: value } : item
      ),
    }));
  };

  // 🔹 Table columns
  const columns = [
    {
      title: "Tên sách",
      dataIndex: "bookSnapshot",
      key: "title",
      render: (book) => book?.title || "—",
    },
    {
      title: "Tác giả",
      dataIndex: "bookSnapshot",
      key: "author",
      render: (book) => book?.author?.name || "—",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (text, record) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(val) => handleQuantityChange(record._id, val)}
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
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "—",
    },
  ];

  // 🔹 Xác nhận mượn
  const handleBorrow = async () => {
    if (!cart.items || cart.items.length === 0) {
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

          // ✅ Payload đúng ObjectId
          const payload = {
            userId,
            items: cart.items.map((item) => ({
              bookId: item.book, // ObjectId thực của sách
              quantity: item.quantity,
              borrowDate: item.borrowDate,
              dueDate: item.dueDate,
            })),
          };

          await axios.post(
            "http://localhost:5000/api/borrowings",
            payload
          );

          // Xóa giỏ hàng
          await axios.delete("http://localhost:5000/api/cart/clear", {
            data: { userId },
          });

          setCart({ items: [] });
          message.success("✅ Mượn sách thành công!");
        } catch (error) {
          console.error(
            "❌ Borrow error:",
            error.response?.data || error.message
          );
          message.error(
            error.response?.data?.message || "Không thể tạo đơn mượn!"
          );
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
        rowKey={(record) => record._id}
        columns={columns}
        dataSource={Array.isArray(cart.items) ? cart.items : []}
        pagination={false}
        bordered
      />
      <Space style={{ marginTop: 20 }}>
        <Button
          type="primary"
          onClick={handleBorrow}
          loading={loading}
          disabled={!cart.items || cart.items.length === 0}
        >
          Xác nhận mượn
        </Button>
      </Space>
    </div>
  );
};

export default Cart;
