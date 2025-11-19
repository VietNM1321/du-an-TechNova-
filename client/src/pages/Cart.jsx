import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, InputNumber, message, Space, Modal, Typography } from "antd";
import { ExclamationCircleOutlined, DeleteOutlined, ClearOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
const Cart = () => {
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState({ items: [] });
  const navigate = useNavigate();
  const token = localStorage.getItem("clientToken");
  const user = JSON.parse(localStorage.getItem("clientUser") || "null");
  const items = Array.isArray(cart.items) ? cart.items : [];
  const isEmpty = items.length === 0;
  const isAdmin = user?.role === "admin";
  const fetchCart = async () => { // gọi giỏ hàng và middelware auth phải đăng nhập mới có hiện giỏ hàng
    try {
      if (!token) throw new Error("UNAUTHENTICATED");
      if (isAdmin) {
        setCart({ items: [], userId: null });
        return;
      }
      const res = await axios.get("http://localhost:5000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data || { items: [] };
      const normalizedItems = Array.isArray(data.items) ? data.items : [];
      setCart({ ...data, items: normalizedItems });
      console.log("Cart fetched:", data);
    } catch (err) {
      console.error("❌ Lỗi khi lấy cart:", err);
      if (err.message === "UNAUTHENTICATED" || err.response?.status === 401) {
        message.warning("Vui lòng đăng nhập để xem giỏ sách.");
        return;
      }
      message.error("Không thể tải giỏ hàng!");
      setCart({ items: [] });
    }
  };
  useEffect(() => {
    fetchCart();
  }, [token, isAdmin]);
  const handleQuantityChange = (_id, value) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item._id === _id ? { ...item, quantity: value } : item
      ),
    }));
  };
  const columns = [
    {
      title: "Sách",
      key: "book",
      render: (_, record) => {
        const book = record.bookId || record.bookSnapshot || {};
        const image = book.images?.[0];
        const author = book.author?.name || record.bookSnapshot?.author?.name;
        return (
          <div className="flex items-center gap-3">
            {image ? (
              <img
                src={image}
                alt={book.title}
                style={{ width: 48, height: 64, objectFit: "cover", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
              />
            ) : (
              <div style={{ width: 48, height: 64 }} className="bg-slate-100 rounded-md" />
            )}
            <div className="min-w-0">
              <div className="font-medium text-slate-900 truncate">{book.title || "—"}</div>
              <div className="text-xs text-slate-500 truncate">{author || ""}</div>
            </div>
          </div>
        );
      },
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
      dataIndex: "returnDate",
      key: "returnDate",
      render: (date, record) => {
        const value = date || record.dueDate; // fallback nếu dữ liệu cũ
        return value ? new Date(value).toLocaleDateString("vi-VN") : "—";
      },
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleRemoveItem(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];
  const handleBorrow = async () => {
    if (isAdmin) {
      message.info("Tài khoản quản trị không thể tạo đơn mượn.");
      return;
    }
    if (!cart.items || cart.items.length === 0) {
      message.warning("Giỏ sách đang trống!");
      return;
    }
    if (!token) {
      message.warning("Vui lòng đăng nhập để mượn sách.");
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
          const payload = {
            items: cart.items.map((item) => ({
              bookId: item.bookId?._id || item.bookId || item.book,
              quantity: item.quantity,
              borrowDate: item.borrowDate,
              dueDate: item.returnDate || item.dueDate,
            })),
          };

          await axios.post(
            "http://localhost:5000/api/borrowings",
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          await axios.delete("http://localhost:5000/api/cart/clear", {
            headers: { Authorization: `Bearer ${token}` },
          });

          setCart({ items: [] });
          message.success("✅ Mượn sách thành công!");
        } catch (error) {
          console.error(
            "❌ Borrow error:",
            error.response?.data || error.message
          );
          const errorData = error.response?.data;
          if (errorData?.errors && Array.isArray(errorData.errors)) {
            // Hiển thị tất cả các lỗi nếu có nhiều
            errorData.errors.forEach((err, index) => {
              message.error(`${index + 1}. ${err}`, 5);
            });
          } else {
            message.error(
              errorData?.message || "Không thể tạo đơn mượn!"
            );
          }
        } finally {
          setLoading(false);
        }
      },
    });
  };
  const handleRemoveItem = async (record) => {
    try {
      if (isAdmin) {
        message.info("Tài khoản quản trị không thể thao tác giỏ sách.");
        return;
      }
      if (!token) {
        message.warning("Vui lòng đăng nhập để thao tác.");
        return;
      }
      const bookId = record.bookId?._id || record.bookId || record.book;
      await axios.delete("http://localhost:5000/api/cart/remove", {
        headers: { Authorization: `Bearer ${token}` },
        data: { bookId },
      });
      message.success("Đã xóa khỏi giỏ.");
      fetchCart();
    } catch (err) {
      console.error("❌ remove item:", err.response?.data || err.message);
      message.error("Không thể xóa sản phẩm.");
    }
  };
  const handleClearAll = async () => {
    Modal.confirm({
      title: "Xóa tất cả giỏ hàng?",
      icon: <ExclamationCircleOutlined />,
      okText: "Xóa hết",
      okButtonProps: { danger: true, icon: <ClearOutlined /> },
      cancelText: "Hủy",
      async onOk() {
        try {
          if (isAdmin) {
            message.info("Tài khoản quản trị không thể thao tác giỏ sách.");
            return;
          }
          if (!token) throw new Error("UNAUTHENTICATED");
          await axios.delete("http://localhost:5000/api/cart/clear", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCart({ items: [] });
          message.success("Đã xóa tất cả.");
        } catch (err) {
          console.error("❌ clear cart:", err.response?.data || err.message);
          message.error("Không thể xóa tất cả.");
        }
      },
    });
  };
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
            <Typography.Title level={3}>📚 Giỏ mượn dành cho sinh viên</Typography.Title>
            <p className="text-slate-600">
              Tài khoản quản trị không sử dụng giỏ sách. Vui lòng đăng nhập bằng tài khoản sinh viên để mượn sách.
            </p>
            <Button type="primary" onClick={() => navigate("/login")}>Đăng nhập tài khoản sinh viên</Button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md ring-1 ring-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
          <Typography.Title level={3} style={{ margin: 0 }}>📚 Giỏ sách mượn</Typography.Title>
            <Space>
              <Button
                danger
                icon={<ClearOutlined />}
                onClick={handleClearAll}
                disabled={!cart.items || cart.items.length === 0}
              >
                Xóa tất cả
              </Button>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleBorrow}
                loading={loading}
                disabled={!cart.items || cart.items.length === 0}
              >
                Xác nhận mượn
              </Button>
            </Space>
          </div>

          {isEmpty ? (
            <div className="text-center py-16 text-slate-500">
              <div className="text-4xl mb-3">📭</div>
              <Typography.Text>Giỏ sách đang trống. Hãy thêm sách để mượn nhé!</Typography.Text>
            </div>
          ) : (
            <>
              <Table
                rowKey={(record) => record._id}
                columns={columns}
                dataSource={items}
                pagination={{ pageSize: 6 }}
                bordered
              />

              <div className="flex justify-end mt-4 text-sm text-slate-600">
                Tổng đầu sách: <span className="font-semibold text-slate-900 ml-1">{items.length}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
