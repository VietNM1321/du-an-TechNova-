import React from "react";
import { useCart } from "../components/cart";

const Cart = () => {
  const { cart, updateItem, removeItem, clearCart } = useCart();

  const total = cart.items.reduce((s, i) => s + (i.price || 0) * i.quantity, 0);

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-6xl mx-auto p-6 bg-gray-100 min-h-screen rounded-lg shadow">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
          🛒 Giỏ sách của bạn
        </h2>

        {cart.items.length === 0 ? (
          <p className="text-center text-gray-500 mt-20 text-lg">
            Giỏ sách trống.
          </p>
        ) : (
          <>
            <div className="space-y-4">
              {cart.items.map((it) => (
                <div
                  key={it.bookId._id}
                  className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-lg shadow hover:shadow-lg transition"
                >
                  <img
                    src={
                      it.bookId.images?.[0] ||
                      "https://cdn-icons-png.flaticon.com/512/2232/2232688.png"
                    }
                    alt={it.bookId.title}
                    className="w-28 h-28 object-cover rounded"
                  />
                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-lg">
                          {it.bookId.title}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Giá: {it.price ?? it.bookId.price ?? 0}₫
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateItem({
                              bookId: it.bookId._id,
                              quantity: it.quantity - 1,
                            })
                          }
                          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          -
                        </button>
                        <div className="px-3">{it.quantity}</div>
                        <button
                          onClick={() =>
                            updateItem({
                              bookId: it.bookId._id,
                              quantity: it.quantity + 1,
                            })
                          }
                          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm bg-gray-50 p-3 rounded">
                      <p>
                        <strong>Họ tên:</strong> {it.fullName || "—"}
                      </p>
                      <p>
                        <strong>Mã SV:</strong> {it.studentId || "—"}
                      </p>
                      <p>
                        <strong>Email:</strong> {it.email || "—"}
                      </p>
                      <p>
                        <strong>Ngày mượn:</strong> {it.borrowDate || "—"}
                      </p>
                      <p>
                        <strong>Ngày trả:</strong> {it.returnDate || "—"}
                      </p>
                    </div>

                    <div className="mt-3 flex justify-between items-center">
                      <div className="font-medium text-blue-700">
                        Tổng: {(it.price || it.bookId.price || 0) * it.quantity}₫
                      </div>
                      <button
                        onClick={() => removeItem(it.bookId._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow">
              <button
                onClick={clearCart}
                className="bg-red-500 text-white px-5 py-2 rounded hover:bg-red-600 mb-3 sm:mb-0"
              >
                Xóa toàn bộ giỏ hàng
              </button>
              <div className="text-2xl font-bold text-blue-700">
                Tổng: {total}₫
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
