import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
<<<<<<< HEAD
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
=======
  const [cart, setCart] = useState({ items: [], userId: "anon" });
  const API = "http://localhost:5000/api/cart";

  const fetchCart = async (userId = cart.userId) => {
    try {
      const res = await axios.get(API, { params: { userId } });
      setCart(res.data || { userId, items: [] });
    } catch (err) {
      console.error("❌ Lỗi fetch cart:", err);
    }
  };

  const addToCart = async ({
    bookId,
>>>>>>> origin/main
    quantity = 1,
    fullName,
    studentId,
    email,
    borrowDate,
    returnDate,
  }) => {
<<<<<<< HEAD
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

=======
  try {
    const res = await axios.post(`${API}/add`, {
      userId: cart.userId,
      bookId,
      quantity,
      fullName,
      studentId,
      email,
      borrowDate,
      returnDate,
    });
    if (res.data?.items) {
      setCart(res.data);
    } else {
      setCart((prev) => {
        const existing = prev.items.find((i) => i.bookId._id === bookId);
        if (existing) {
          return {
            ...prev,
            items: prev.items.map((i) =>
              i.bookId._id === bookId
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
              bookId: { _id: bookId },
              quantity,
              borrowDate,
              returnDate,
              fullName,
              studentId,
              email,
            },
          ],
        };
      });
    }
  } catch (err) {
    console.error("❌ Lỗi addToCart:", err);
  }
};

  const updateItem = async ({ bookId, quantity }) => {
    try {
      const res = await axios.put(`${API}/update`, {
        userId: cart.userId,
        bookId,
        quantity,
      });
      setCart(res.data);
    } catch (err) {
      console.error("❌ Lỗi updateItem:", err);
    }
  };

  const removeItem = async (bookId) => {
    try {
      const res = await axios.delete(`${API}/remove`, {
        data: { userId: cart.userId, bookId },
      });
      setCart(res.data);
    } catch (err) {
      console.error("❌ Lỗi removeItem:", err);
    }
  };

  const clearCart = async () => {
    try {
      const res = await axios.delete(`${API}/clear`, {
        data: { userId: cart.userId },
      });
      setCart(res.data || { userId: cart.userId, items: [] });
    } catch (err) {
      console.error("❌ Lỗi clearCart:", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

>>>>>>> origin/main
  return (
    <CartContext.Provider
      value={{
        cart,
<<<<<<< HEAD
        addToCart,
        removeItem,
        clearCart,
        confirmBorrow,
=======
        fetchCart,
        addToCart,
        updateItem,
        removeItem,
        clearCart,
>>>>>>> origin/main
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
