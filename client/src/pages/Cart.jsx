import React from "react";
import axios from "axios";
import { useCart } from "../components/cart";
import { toast } from "react-toastify";

const Cart = () => {
  const { cart, updateItem, removeItem, clearCart } = useCart();
  const [loading, setLoading] = React.useState(false);

  const total = cart.items.reduce((s, i) => s + (i.price || 0) * i.quantity, 0);

  const handleBorrow = async () => {
  try {
    if (cart.items.length === 0) return toast.warning("Giỏ hàng trống, không thể mượn!");
      setLoading(true);
      const userId = cart.userId && cart.userId !== 'anon' ? cart.userId : undefined;
      const now = new Date();
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(now.getDate() + 7);

      const borrowData = cart.items.map((it) => ({
        bookId: it.bookId._id,
        quantity: it.quantity,
        borrowDate: it.borrowDate || new Date(),
        returnDate: it.returnDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }));

      const res = await axios.post("http://localhost:5000/api/borrowings", {
        borrowings: borrowData,
        userId,
      });

      if (res.status === 201) {
        toast.success("📚 Mượn sách thành công!");
        await clearCart();
      } else {
        toast.error(res.data?.message || "Mượn sách không thành công");
      }
    } catch (err) {
      if (err?.response) {
        console.error('Borrow error response data:', err.response.data);
        console.error('Borrow error response status:', err.response.status);
      } else {
        console.error('Borrow error:', err.message || err);
      }
      toast.error(err.response?.data?.message || "Có lỗi xảy ra khi mượn sách!");
    } finally {
      setLoading(false);
    }
  };

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

            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow gap-4">
              <button
                onClick={clearCart}
                className="bg-red-500 text-white px-5 py-2 rounded hover:bg-red-600"
              >
                Xóa toàn bộ giỏ hàng
              </button>

              <div className="text-2xl font-bold text-blue-700">
                Tổng: {total}₫
              </div>

              <button
                onClick={handleBorrow}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : '✅ Xác nhận mượn sách'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
