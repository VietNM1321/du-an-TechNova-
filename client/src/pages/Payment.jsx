import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { CreditCard, ArrowLeft, Clock } from "lucide-react";
import { CheckCircle } from "lucide-react";
const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [borrowing, setBorrowing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [paymentNote, setPaymentNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fixedQRCode = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=VCB%3A1234567890%3ATHU%20VIEN%20SACH";
  useEffect(() => {
    const fetchBorrowing = async () => {
      try {
        const token = localStorage.getItem("clientToken") || localStorage.getItem("adminToken");
        const storedUser = JSON.parse(localStorage.getItem("clientUser") || "null");
        const userId = storedUser?._id || storedUser?.id;
        if (!token || !userId) {
          alert("Vui lòng đăng nhập để thanh toán!");
          navigate("/login");
          return;
        }
        const res = await axios.get(`http://localhost:5000/api/borrowings/history/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        const found = res.data.find(b => b._id === id);
        if (found) {
          setBorrowing(found);
        } else {
          alert("Không tìm thấy đơn mượn!");
          navigate("/history");
        }
      } catch (error) {
        console.error("❌ Lỗi tải thông tin đơn mượn:", error);
        alert("Không thể tải thông tin đơn mượn!");
        navigate("/history");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchBorrowing();
    }
  }, [id, navigate]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem("clientToken") || localStorage.getItem("adminToken");
      console.log("💳 Creating payment for borrowing:", borrowing._id, "amount:", compensationAmount);
      const resp = await axios.post(
        "http://localhost:5000/vnpay/create_payment_for_borrowing",
        { borrowingId: borrowing._id, amount: compensationAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ Payment URL created:", resp.data?.url ? "Yes" : "No");
      const url = resp.data?.url;
      if (url) {
        window.location.href = url;
        return;
      }
      alert(resp.data?.message || "Không tạo được đường dẫn thanh toán trực tuyến.");
    } catch (error) {
      console.error("❌ Payment error:", error.response?.data || error.message);
      alert(error.response?.data?.error || "❌ Thanh toán thất bại!");
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-160px)] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-gray-700 font-semibold text-lg">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }
  if (!borrowing) {
    return (
      <div className="min-h-[calc(100vh-160px)] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <p className="text-gray-700 font-semibold text-lg">Không tìm thấy đơn mượn!</p>
          <button
            onClick={() => navigate("/history")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }
  const compensationAmount = borrowing.compensationAmount || 50000;
  return (
    <div className="min-h-[calc(100vh-160px)] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <button
            onClick={() => navigate("/history")}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition mb-3 font-medium group text-sm"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại</span>
          </button>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <CreditCard className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">💳 Thanh toán đền bù</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-white/20">
          {/* Thông tin đơn mượn - Compact */}
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div>
                <p className="text-blue-100 text-xs mb-1">📚 Sách:</p>
                <p className="font-bold text-base text-white line-clamp-1">
                  {borrowing.book?.title || borrowing.bookSnapshot?.title || "—"}
                </p>
                {borrowing.book?.author?.name && (
                  <p className="text-blue-100 text-xs mt-1">✍️ {borrowing.book.author.name}</p>
                )}
              </div>
              <div>
                <p className="text-blue-100 text-xs mb-1">Trạng thái:</p>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full">
                  <span>{borrowing.damageType === "lost" ? "📚" : "🔧"}</span>
                  <span className="font-semibold text-sm">
                    {borrowing.damageType === "lost" ? "Mất sách" : "Hỏng sách"}
                  </span>
                </div>
              </div>
              {borrowing.borrowingCode && (
                <div className="md:col-span-2">
                  <p className="text-blue-100 text-xs mb-1">🔖 Mã đơn mượn:</p>
                  <p className="font-mono font-bold text-lg text-yellow-300 bg-white/10 px-3 py-2 rounded-lg inline-block">
                    {borrowing.borrowingCode}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Số tiền cần thanh toán - Compact */}
            <div className="bg-gradient-to-br from-red-50 via-pink-50 to-red-50 p-4 rounded-xl border-2 border-red-200 text-center shadow-md">
              <p className="text-xs uppercase tracking-wide text-gray-600 mb-1 font-semibold">Số tiền đền bù</p>
              <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">
                {compensationAmount.toLocaleString("vi-VN")} VNĐ
              </p>
            </div>

            {/* Phương thức thanh toán - Compact */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>💰</span>
                <span>Phương thức thanh toán</span>
              </label>
              <div className="grid grid-cols-1 gap-3">
                {/* VNPay Online Payment */}
                <button
                  disabled
                  className="p-4 rounded-xl border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md cursor-default"
                >
                  <CreditCard
                    size={32}
                    className="mx-auto mb-2 text-blue-600"
                  />
                  <p className="text-sm font-bold text-blue-700">💳 Thanh toán trực tuyến (VNPay)</p>
                </button>
              </div>
            </div>

            {/* QR Code cố định (nếu chọn ngân hàng) - Compact */}
            {paymentMethod === "bank" && (
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-800 text-center">
                  📱 Quét mã QR để thanh toán
                </label>

                {/* QR Code cố định */}
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-xl border-2 border-blue-200 shadow-lg">
                    <img
                      src={fixedQRCode}
                      alt="QR Code thanh toán"
                      className="w-48 h-48 mx-auto rounded-lg"
                    />
                  </div>
                </div>

                {/* Thông tin chuyển khoản - Compact */}
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-3 rounded-xl border-2 border-amber-200">
                  <p className="text-xs font-bold text-amber-800 mb-2 text-center">📋 Thông tin chuyển khoản</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center bg-white/70 px-2 py-1.5 rounded-lg">
                      <span className="text-gray-600">Số TK:</span>
                      <span className="font-bold text-gray-900">1234567890</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/70 px-2 py-1.5 rounded-lg">
                      <span className="text-gray-600">Ngân hàng:</span>
                      <span className="font-bold text-gray-900">Vietcombank</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/70 px-2 py-1.5 rounded-lg">
                      <span className="text-gray-600">Chủ TK:</span>
                      <span className="font-bold text-gray-900">THƯ VIỆN SÁCH</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-amber-300 bg-white/70 px-2 py-1.5 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Nội dung:</span>
                        <span className="font-bold text-blue-600 text-xs">
                          Đền bù - {borrowing._id.slice(-6)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ghi chú - Compact */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-1">
                <span>📝</span>
                <span>Ghi chú (tùy chọn)</span>
              </label>
              <textarea
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Nhập ghi chú..."
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all bg-white/80 text-gray-700 text-sm"
                rows={2}
              />
            </div>

            {/* Lưu ý - Compact */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-3 rounded-lg border-2 border-amber-200">
              <p className="text-xs text-amber-800 flex items-start gap-2">
                <Clock size={16} className="mt-0.5 flex-shrink-0 text-amber-600" />
                <span>
                  <strong>Lưu ý:</strong> Vui lòng thanh toán qua cổng VNPay. Đơn sẽ được cập nhật ngay lập tức sau khi thanh toán thành công.
                </span>
              </p>
            </div>

            {/* Footer với nút hành động - Compact */}
            <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 border-t border-gray-200 flex justify-between gap-3">
              <button
                onClick={() => navigate("/history")}
                className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all font-semibold text-sm"
                disabled={submitting}
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Xác nhận thanh toán
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;

