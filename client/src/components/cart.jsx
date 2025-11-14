import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
const CartContext = createContext();
export const useCart = () => useContext(CartContext);
export function CartProvider({ children }) {
  const savedUser = JSON.parse(localStorage.getItem("clientUser") || "null");
  const savedToken = localStorage.getItem("clientToken");
  const initialUserId = savedUser?._id || savedUser?.id || null;
  const derivedStudentId = savedUser?.studentId || savedUser?.studentCode || "";
  const isAdmin = savedUser?.role === "admin";
  const [cart, setCart] = useState({ items: [], userId: initialUserId });
  const fetchCart = async () => {
    try {
      if (!savedToken || isAdmin) {
        if (isAdmin) {
          setCart({ userId: null, items: [] });
          localStorage.removeItem("cart");
        }
        return;
      }
      const res = await axios.get("http://localhost:5000/api/cart", { headers: { Authorization: `Bearer ${savedToken}` } });
      setCart(res.data || { userId: initialUserId, items: [] });
      localStorage.setItem("cart", JSON.stringify(res.data || { userId: initialUserId, items: [] }));
    } catch (err) {
      console.error("❌ Lỗi fetch cart:", err);
    }
  };
  const addToCart = async ({bookId,quantity = 1,fullName,studentId,email,borrowDate,returnDate,
  }) => {
    try {
      if (isAdmin) {
        alert("Tài khoản quản trị không thể mượn sách.");
        throw new Error("Admin not allowed");
      }
      if (!savedToken || !initialUserId) {
        alert("Vui lòng đăng nhập để mượn sách.");
        throw new Error("Not authenticated");
      }
      const payload = {bookId,quantity,fullName: fullName || savedUser?.fullName,studentId: studentId || derivedStudentId,email: email || savedUser?.email,borrowDate,returnDate,
      };
      const res = await axios.post(`http://localhost:5000/api/cart/add`,
        payload,
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
      if (!savedToken || isAdmin) throw new Error("Not authenticated");
      const res = await axios.put(`http://localhost:5000/api/cart/update`,
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
      if (!savedToken || isAdmin) throw new Error("Not authenticated");
      const res = await axios.delete(`http://localhost:5000/api/cart/remove`, {
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
      if (!savedToken || isAdmin) throw new Error("Not authenticated");
      const res = await axios.delete(`http://localhost:5000/api/cart/clear`, { headers: { Authorization: `Bearer ${savedToken}` } });
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
