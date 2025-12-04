import React, { useState } from "react";
import axios from "axios";
import { X, CreditCard } from "lucide-react";
const PaymentModal = ({ visible, onClose, borrowing, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [paymentNote, setPaymentNote] = useState("");
  const [loading, setLoading] = useState(false);
  if (!visible || !borrowing) return null;
  const compensationAmount = borrowing.compensationAmount || 50000;
  const fixedQRCode = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=VCB%3A1234567890%3ATHU%20VIEN%20SACH";
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("clientToken") || localStorage.getItem("adminToken");
        const resp = await axios.post(
          "http://localhost:5000/vnpay/create_payment_for_borrowing",
          { borrowingId: borrowing._id, amount: compensationAmount },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const url = resp.data?.url;
        if (url) {
          window.location.href = url;
          return;
        }
        alert(resp.data?.message || "Không tạo được đường dẫn thanh toán trực tuyến.");
      onSuccess?.();
      onClose();
      setPaymentMethod("bank");
      setPaymentNote("");
    } catch (error) {
      console.error("❌ Lỗi thanh toán:", error.response?.data || error.message);
      alert(error.response?.data?.message || "❌ Thanh toán thất bại!");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-white/20">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>💳</span>
            <span>Thanh toán đền bù</span>
          </h2>
          <button
            onClick={onClose}
            className="text-white/90 hover:text-white hover:bg-white/20 rounded-full p-1 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 bg-white/50">
          {/* Thông tin đơn mượn */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold mb-2">📚 Sách mượn</p>
            <p className="font-bold text-gray-900 text-lg mb-2">
              {borrowing.book?.title || borrowing.bookSnapshot?.title || "—"}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 rounded-full">
              <span className="text-xs text-gray-600">Loại:</span>
              <span className="text-xs font-semibold text-orange-600">
                {borrowing.damageType === "lost" ? "Mất sách" : "Hỏng sách"}
              </span>
            </div>
          </div>

          {/* Số tiền cần thanh toán */}
          <div className="bg-gradient-to-br from-red-50 via-pink-50 to-red-50 p-6 rounded-xl border-2 border-red-200 shadow-lg">
            <p className="text-sm text-gray-600 mb-2 font-medium">Số tiền đền bù:</p>
            <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">
              {compensationAmount.toLocaleString("vi-VN")} VNĐ
            </p>
          </div>

          {/* Phương thức thanh toán */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              💰 Chọn phương thức thanh toán:
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Only online bank payment is supported now */}
              <div className="p-5 rounded-xl border-2 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg shadow-blue-200/50 text-center col-span-2">
                <CreditCard size={36} className="mx-auto mb-3 text-blue-600" />
                <p className="font-bold text-sm text-blue-700">💳 Thanh toán trực tuyến (VNPay)</p>
                <p className="text-xs text-blue-600 mt-1">Thanh toán an toàn qua cổng VNPay</p>
              </div>
            </div>
          </div>

          {/* QR Code cố định (nếu chọn ngân hàng) */}
          {paymentMethod === "bank" && (
            <div className="space-y-5">
              <label className="block text-sm font-semibold text-gray-700 text-center">
                📱 Quét mã QR để thanh toán:
              </label>

              {/* QR Code cố định */}
              <div className="flex justify-center">
                <div className="bg-white p-6 rounded-2xl border-2 border-blue-200 shadow-xl ring-4 ring-blue-100">
                  <img
                    src={fixedQRCode}
                    alt="QR Code thanh toán"
                    className="w-64 h-64 mx-auto rounded-lg"
                  />
                </div>
              </div>

              {/* Thông tin chuyển khoản */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-5 rounded-xl border-2 border-amber-200 shadow-md">
                <p className="text-sm font-bold text-amber-800 mb-3 text-center flex items-center justify-center gap-2">
                  <span>📋</span>
                  <span>Thông tin chuyển khoản</span>
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center bg-white/60 px-3 py-2 rounded-lg">
                    <span className="text-gray-600">Số tài khoản:</span>
                    <span className="font-bold text-gray-900">1234567890</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/60 px-3 py-2 rounded-lg">
                    <span className="text-gray-600">Ngân hàng:</span>
                    <span className="font-bold text-gray-900">Vietcombank</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/60 px-3 py-2 rounded-lg">
                    <span className="text-gray-600">Chủ tài khoản:</span>
                    <span className="font-bold text-gray-900">THƯ VIỆN SÁCH</span>
                  </div>
                  <div className="mt-3 pt-3 border-t-2 border-amber-300 bg-white/60 px-3 py-2 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Nội dung:</span>
                      <span className="font-bold text-blue-600">Đền bù sách - {borrowing._id.slice(-6)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ghi chú */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📝 Ghi chú (tùy chọn):
            </label>
            <textarea
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              placeholder="Nhập ghi chú về thanh toán..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all bg-white/80"
              rows={3}
            />
          </div>

          {/* Lưu ý */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-xl border-2 border-amber-200 shadow-sm">
            <p className="text-sm text-amber-800 flex items-start gap-2">
              <span className="text-lg">💡</span>
              <span>
                <strong>Lưu ý:</strong> Vui lòng thanh toán qua cổng VNPay. Sau khi thanh toán thành công, 
                đơn sẽ được cập nhật ngay lập tức.
              </span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all transform hover:scale-105"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? "⏳ Đang xử lý..." : "✅ Xác nhận thanh toán"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;