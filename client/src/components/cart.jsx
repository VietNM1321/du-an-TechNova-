import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const savedUser = JSON.parse(localStorage.getItem("user") || "null");
  const savedToken = localStorage.getItem("token");
  const initialUserId = savedUser?.id || null;
  const [cart, setCart] = useState({ items: [], userId: initialUserId });
  const API = "http://localhost:5000/api/cart";

  const fetchCart = async () => {
    try {
      if (!savedToken) return; // chưa đăng nhập thì bỏ qua
      const res = await axios.get(API, { headers: { Authorization: `Bearer ${savedToken}` } });
      setCart(res.data || { userId: initialUserId, items: [] });
      localStorage.setItem("cart", JSON.stringify(res.data || { userId: initialUserId, items: [] }));
    } catch (err) {
      console.error("❌ Lỗi fetch cart:", err);
    }
  };

  const addToCart = async ({
    bookId,
    quantity = 1,
    fullName,
    studentId,
    email,
    borrowDate,
    returnDate,
  }) => {
    try {
      if (!savedToken || !initialUserId) {
        alert("Vui lòng đăng nhập để mượn sách.");
        throw new Error("Not authenticated");
      }
      const res = await axios.post(
        `${API}/add`,
        { bookId, quantity, fullName, studentId, email, borrowDate, returnDate },
        { headers: { Authorization: `Bearer ${savedToken}` } }
      );
      setCart(res.data);
      localStorage.setItem("cart", JSON.stringify(res.data));
    } catch (err) {
      console.error("❌ Lỗi addToCart:", err);
    }
  };

  const updateItem = async ({ bookId, quantity }) => {
    try {
      if (!savedToken) throw new Error("Not authenticated");
      const res = await axios.put(
        `${API}/update`,
        { bookId, quantity },
        { headers: { Authorization: `Bearer ${savedToken}` } }
      );
      setCart(res.data);
      localStorage.setItem("cart", JSON.stringify(res.data));
    } catch (err) {
      console.error("❌ Lỗi updateItem:", err);
    }
  };

  const removeItem = async (bookId) => {
    try {
      if (!savedToken) throw new Error("Not authenticated");
      const res = await axios.delete(`${API}/remove`, {
        headers: { Authorization: `Bearer ${savedToken}` },
        data: { bookId },
      });
      setCart(res.data);
      localStorage.setItem("cart", JSON.stringify(res.data));
    } catch (err) {
      console.error("❌ Lỗi removeItem:", err);
    }
  };

  const clearCart = async () => {
    try {
      if (!savedToken) throw new Error("Not authenticated");
      const res = await axios.delete(`${API}/clear`, { headers: { Authorization: `Bearer ${savedToken}` } });
      setCart(res.data || { userId: initialUserId, items: [] });
      localStorage.setItem("cart", JSON.stringify(res.data || { userId: initialUserId, items: [] }));
    } catch (err) {
      console.error("❌ Lỗi clearCart:", err);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
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
