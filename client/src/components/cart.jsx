import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);
export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], userId: "anon" }); // lưu trữ giỏ hàng nếu chưa đăng nhập là mặc định là anon
  const API = "http://localhost:5000/api/cart";

  const fetchCart = async (userId = cart.userId) => {
    try {
      const res = await axios.get(API, { params: { userId } });
      setCart(res.data || { userId, items: [] });
    } catch (err) {
      console.error("Lỗi fetch cart:", err);
    }
  };

  const addToCart = async ({ bookId, quantity = 1 }) => {
    try {
      const res = await axios.post(`${API}/add`, {
        userId: cart.userId,
        bookId,
        quantity,
      });
      setCart(res.data);
    } catch (err) {
      console.error("Lỗi addToCart:", err);
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
      console.error("Lỗi updateItem:", err);
    }
  };

  const removeItem = async (bookId) => {
    try {
      const res = await axios.delete(`${API}/remove`, {
        data: { userId: cart.userId, bookId },
      });
      setCart(res.data);
    } catch (err) {
      console.error("Lỗi removeItem:", err);
    }
  };

  const clearCart = async () => {
    try {
      const res = await axios.delete(`${API}/clear`, {
        data: { userId: cart.userId },
      });
      setCart(res.data || { userId: cart.userId, items: [] });
    } catch (err) {
      console.error("Lỗi clearCart:", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider
      value={{ cart, fetchCart, addToCart, updateItem, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
