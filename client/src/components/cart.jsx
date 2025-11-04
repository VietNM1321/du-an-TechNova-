import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : { items: [], userId: "anon" };
  });

  // 🔁 Lưu cart xuống localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // 🧩 Thêm sách vào giỏ (chỉ lưu tạm)
  const addToCart = ({
    bookId,
    title,
    quantity = 1,
    fullName,
    studentId,
    email,
    borrowDate,
    returnDate,
  }) => {
    setCart((prev) => {
      const existing = prev.items.find((i) => i.bookId === bookId);
      if (existing) {
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.bookId === bookId
              ? {
                  ...i,
                  quantity: i.quantity + quantity,
                  borrowDate,
                  returnDate,
                  fullName,
                  studentId,
                  email,
                }
              : i
          ),
        };
      }
      return {
        ...prev,
        items: [
          ...prev.items,
          {
            bookId,
            title,
            quantity,
            fullName,
            studentId,
            email,
            borrowDate,
            returnDate,
          },
        ],
      };
    });
  };

  // 🧮 Xóa 1 mục
  const removeItem = (bookId) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.bookId !== bookId),
    }));
  };

  // 🗑️ Xóa toàn bộ giỏ
  const clearCart = () => {
    setCart({ ...cart, items: [] });
    localStorage.removeItem("cart");
  };

  // ✅ Xác nhận mượn – gửi toàn bộ giỏ hàng vào Mongo
  const confirmBorrow = async () => {
    if (cart.items.length === 0) {
      alert("Giỏ hàng trống!");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/borrowings", {
        userId: cart.userId,
        items: cart.items,
      });
      console.log("✅ Đơn mượn đã lưu:", res.data);
      alert("Đã xác nhận mượn thành công!");
      clearCart();
    } catch (err) {
      console.error("❌ Lỗi xác nhận mượn:", err);
      alert("Không thể gửi đơn mượn!");
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeItem,
        clearCart,
        confirmBorrow,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
