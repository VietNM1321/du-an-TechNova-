import React, { useState } from "react";
import axios from "axios";
import { X, CreditCard, Wallet, Upload, Image as ImageIcon } from "lucide-react";

const PaymentModal = ({ visible, onClose, borrowing, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [qrCodePreview, setQrCodePreview] = useState(null);
  const [paymentNote, setPaymentNote] = useState("");
  const [loading, setLoading] = useState(false);

  if (!visible || !borrowing) return null;

  const compensationAmount = borrowing.compensationAmount || 50000;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQrCodeFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrCodePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (paymentMethod === "bank" && !qrCodeFile && !borrowing.qrCodeImage) {
      alert("⚠️ Vui lòng upload ảnh QR code khi thanh toán qua ngân hàng!");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("clientToken") || localStorage.getItem("adminToken");

      const formData = new FormData();
      formData.append("paymentMethod", paymentMethod);
      formData.append("paymentNote", paymentNote);
      if (qrCodeFile) {
        formData.append("qrCodeImage", qrCodeFile);
      }

      const res = await axios.put(
        `http://localhost:5000/api/borrowings/${borrowing._id}/pay`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(res.data.message || "✅ Thanh toán thành công!");
      onSuccess?.();
      onClose();
      // Reset form
      setPaymentMethod("cash");
      setQrCodeFile(null);
      setQrCodePreview(null);
      setPaymentNote("");
    } catch (error) {
      console.error("❌ Lỗi thanh toán:", error.response?.data || error.message);
      alert(error.response?.data?.message || "❌ Thanh toán thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">💳 Thanh toán đền bù</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Thông tin đơn mượn */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Sách:</p>
            <p className="font-semibold text-gray-800">
              {borrowing.book?.title || borrowing.bookSnapshot?.title || "—"}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Loại: {borrowing.damageType === "lost" ? "Mất sách" : "Hỏng sách"}
            </p>
          </div>

          {/* Số tiền cần thanh toán */}
          <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
            <p className="text-sm text-gray-600 mb-1">Số tiền đền bù:</p>
            <p className="text-3xl font-bold text-red-600">
              {compensationAmount.toLocaleString("vi-VN")} VNĐ
            </p>
          </div>

          {/* Phương thức thanh toán */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chọn phương thức thanh toán:
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Tiền mặt */}
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === "cash"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Wallet
                  size={32}
                  className={`mx-auto mb-2 ${
                    paymentMethod === "cash" ? "text-blue-600" : "text-gray-400"
                  }`}
                />
                <p
                  className={`font-semibold ${
                    paymentMethod === "cash" ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  Tiền mặt
                </p>
              </button>

              {/* Ngân hàng */}
              <button
                onClick={() => setPaymentMethod("bank")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === "bank"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <CreditCard
                  size={32}
                  className={`mx-auto mb-2 ${
                    paymentMethod === "bank" ? "text-blue-600" : "text-gray-400"
                  }`}
                />
                <p
                  className={`font-semibold ${
                    paymentMethod === "bank" ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  Ngân hàng
                </p>
              </button>
            </div>
          </div>

          {/* QR Code (nếu chọn ngân hàng) */}
          {paymentMethod === "bank" && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Ảnh QR Code thanh toán:
              </label>

              {/* Hiển thị QR code hiện tại nếu có */}
              {borrowing.qrCodeImage && !qrCodePreview && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">QR Code hiện tại:</p>
                  <img
                    src={`http://localhost:5000/${borrowing.qrCodeImage}`}
                    alt="QR Code"
                    className="w-full max-w-xs mx-auto border rounded-lg"
                  />
                </div>
              )}

              {/* Upload QR code mới */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="qrCodeUpload"
                />
                <label
                  htmlFor="qrCodeUpload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {qrCodePreview ? (
                    <>
                      <img
                        src={qrCodePreview}
                        alt="QR Code Preview"
                        className="w-48 h-48 object-contain mx-auto mb-2 border rounded-lg"
                      />
                      <p className="text-sm text-blue-600">Click để thay đổi ảnh</p>
                    </>
                  ) : (
                    <>
                      <Upload size={48} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Click để upload ảnh QR Code
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        (JPG, PNG, max 5MB)
                      </p>
                    </>
                  )}
                </label>
              </div>

              {/* Thông tin chuyển khoản (nếu cần) */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm font-semibold text-yellow-800 mb-2">
                  📋 Thông tin chuyển khoản:
                </p>
                <p className="text-sm text-gray-700">
                  Số tài khoản: <span className="font-semibold">1234567890</span>
                </p>
                <p className="text-sm text-gray-700">
                  Ngân hàng: <span className="font-semibold">Vietcombank</span>
                </p>
                <p className="text-sm text-gray-700">
                  Chủ tài khoản: <span className="font-semibold">THƯ VIỆN SÁCH</span>
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  Nội dung: <span className="font-semibold">Đền bù sách - {borrowing._id.slice(-6)}</span>
                </p>
              </div>
            </div>
          )}

          {/* Ghi chú */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú (tùy chọn):
            </label>
            <textarea
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              placeholder="Nhập ghi chú về thanh toán..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              rows={3}
            />
          </div>

          {/* Lưu ý */}
          {paymentMethod === "cash" && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                💡 <strong>Lưu ý:</strong> Vui lòng thanh toán trực tiếp tại thư viện. Sau khi
                thanh toán, đơn sẽ được cập nhật ngay lập tức.
              </p>
            </div>
          )}

          {paymentMethod === "bank" && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                💡 <strong>Lưu ý:</strong> Sau khi chuyển khoản, vui lòng upload ảnh QR Code hoặc
                ảnh chụp màn hình biên lai. Thanh toán sẽ được xác nhận bởi quản trị viên trong
                vòng 24 giờ.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang xử lý..." : "Xác nhận thanh toán"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

