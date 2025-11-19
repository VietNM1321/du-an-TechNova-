import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ userId: null, items: [] });

  const API = "http://localhost:5000/api/cart";
  const user = JSON.parse(localStorage.getItem("clientUser"));
  const userId = user?._id || user?.id || null;
  const isAdmin = user?.role === "admin";

  const fetchCart = useCallback(async () => {
    if (!userId || isAdmin) {
      setCart({ userId: null, items: [] });
      localStorage.removeItem("cart");
      return;
    }
    try {
      const res = await axios.get(API, { params: { userId } });
      setCart(res.data || { userId, items: [] });
    } catch (err) {
      console.error("❌ Lỗi fetchCart:", err);
    }
  }, [userId]);

  const addToCart = async ({ bookId, quantity = 1, borrowDate, returnDate }) => {
    if (!userId || isAdmin) {
      if (isAdmin) alert("Tài khoản quản trị không thể mượn sách.");
      return;
    }
    try {
      const payload = {
        userId,
        bookId,
        quantity,
        fullName: user.fullName,
        studentId: user.studentId || user.studentCode || "",
        email: user.email,
        borrowDate,
        returnDate,
      };
      const res = await axios.post(`${API}/add`, payload);
      setCart(res.data);
      return { success: true };
    } catch (err) {
      console.error("❌ Lỗi addToCart:", err);
      const errorMessage = err.response?.data?.message || "Không thể thêm sách vào giỏ hàng!";
      throw new Error(errorMessage);
    }
  };

  const updateItem = async ({ bookId, quantity }) => {
    if (!userId || isAdmin) return;
    try {
      const res = await axios.put(`${API}/update`, { userId, bookId, quantity });
      setCart(res.data);
    } catch (err) {
      console.error("❌ Lỗi updateItem:", err);
    }
  };

  const removeItem = async (bookId) => {
    if (!userId || isAdmin) return;
    try {
      const res = await axios.delete(`${API}/remove`, { data: { userId, bookId } });
      setCart(res.data);
    } catch (err) {
      console.error("❌ Lỗi removeItem:", err);
    }
  };

  const clearCart = async () => {
    if (!userId || isAdmin) return;
    try {
      const res = await axios.delete(`${API}/clear`, { data: { userId } });
      setCart(res.data || { userId, items: [] });
    } catch (err) {
      console.error("❌ Lỗi clearCart:", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <CartContext.Provider
      value={{ cart, fetchCart, addToCart, updateItem, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
