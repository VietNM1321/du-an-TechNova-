import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { CreditCard, Wallet, Upload, ArrowLeft, CheckCircle } from "lucide-react";

const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [borrowing, setBorrowing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [qrCodePreview, setQrCodePreview] = useState(null);
  const [paymentNote, setPaymentNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

        // Lấy danh sách borrowings của user và tìm borrowing có ID phù hợp
        const res = await axios.get(
          `http://localhost:5000/api/borrowings/history/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        const found = res.data.find(b => b._id === id);
        if (found) {
          setBorrowing(found);
          if (found.qrCodeImage) {
            setQrCodePreview(`http://localhost:5000/${found.qrCodeImage}`);
          }
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
      setSubmitting(true);
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
      navigate("/history");
    } catch (error) {
      console.error("❌ Lỗi thanh toán:", error.response?.data || error.message);
      alert(error.response?.data?.message || "❌ Thanh toán thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!borrowing) {
    return null;
  }

  const compensationAmount = borrowing.compensationAmount || 50000;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header với nút quay lại */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/history")}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition mb-4 font-medium"
          >
            <ArrowLeft size={20} />
            <span>Quay lại lịch sử mượn sách</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-3 rounded-full">
              <CreditCard className="text-blue-600" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Thanh toán đền bù</h1>
              <p className="text-gray-600 mt-1">Vui lòng thanh toán để hoàn tất đơn mượn sách</p>
            </div>
          </div>
        </div>

        {/* Card chính */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {/* Thông tin đơn mượn */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>📚</span>
              Thông tin đơn mượn
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div>
                <p className="text-blue-100 text-sm mb-1">Tên sách:</p>
                <p className="font-bold text-lg text-white">
                  {borrowing.book?.title || borrowing.bookSnapshot?.title || "—"}
                </p>
                {borrowing.book?.author?.name && (
                  <p className="text-blue-100 text-sm mt-1">
                    Tác giả: {borrowing.book.author.name}
                  </p>
                )}
              </div>
              <div>
                <p className="text-blue-100 text-sm mb-1">Trạng thái:</p>
                <p className="font-semibold text-white text-lg">
                  {borrowing.damageType === "lost" ? "📚 Mất sách" : "🔧 Hỏng sách"}
                </p>
                <p className="text-blue-100 text-sm mt-1">
                  Ngày mượn: {new Date(borrowing.borrowDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Số tiền cần thanh toán */}
            <div className="bg-red-50 p-6 rounded-xl border-2 border-red-200 text-center">
              <p className="text-sm text-gray-600 mb-2">Số tiền đền bù</p>
              <p className="text-4xl font-bold text-red-600">
                {compensationAmount.toLocaleString("vi-VN")} VNĐ
              </p>
            </div>

            {/* Phương thức thanh toán */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                Chọn phương thức thanh toán:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tiền mặt */}
                <button
                  onClick={() => setPaymentMethod("cash")}
                  className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                    paymentMethod === "cash"
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <Wallet
                    size={48}
                    className={`mx-auto mb-3 ${
                      paymentMethod === "cash" ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-lg font-semibold ${
                      paymentMethod === "cash" ? "text-blue-600" : "text-gray-600"
                    }`}
                  >
                    Tiền mặt
                  </p>
                  {paymentMethod === "cash" && (
                    <p className="text-sm text-gray-500 mt-2">
                      Thanh toán trực tiếp tại thư viện
                    </p>
                  )}
                </button>

                {/* Ngân hàng */}
                <button
                  onClick={() => setPaymentMethod("bank")}
                  className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                    paymentMethod === "bank"
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <CreditCard
                    size={48}
                    className={`mx-auto mb-3 ${
                      paymentMethod === "bank" ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-lg font-semibold ${
                      paymentMethod === "bank" ? "text-blue-600" : "text-gray-600"
                    }`}
                  >
                    Ngân hàng
                  </p>
                  {paymentMethod === "bank" && (
                    <p className="text-sm text-gray-500 mt-2">
                      Chuyển khoản qua ngân hàng
                    </p>
                  )}
                </button>
              </div>
            </div>

            {/* QR Code (nếu chọn ngân hàng) */}
            {paymentMethod === "bank" && (
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-800">
                  Ảnh QR Code thanh toán:
                </label>

                {/* Hiển thị QR code hiện tại nếu có */}
                {borrowing.qrCodeImage && !qrCodePreview?.startsWith("data:") && (
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="text-sm text-gray-600 mb-2">QR Code đã upload:</p>
                    <img
                      src={`http://localhost:5000/${borrowing.qrCodeImage}`}
                      alt="QR Code"
                      className="w-full max-w-xs mx-auto border rounded-lg shadow-md"
                    />
                  </div>
                )}

                {/* Upload QR code mới */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition">
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
                          className="w-64 h-64 object-contain mx-auto mb-3 border-2 border-blue-300 rounded-lg shadow-lg"
                        />
                        <p className="text-sm text-blue-600 font-medium">Click để thay đổi ảnh</p>
                      </>
                    ) : (
                      <>
                        <Upload size={64} className="text-gray-400 mx-auto mb-3" />
                        <p className="text-lg text-gray-700 font-medium">
                          Click để upload ảnh QR Code
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          (JPG, PNG, max 5MB)
                        </p>
                      </>
                    )}
                  </label>
                </div>

                {/* Thông tin chuyển khoản */}
                <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-200">
                  <p className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
                    <CreditCard size={20} />
                    Thông tin chuyển khoản:
                  </p>
                  <div className="space-y-2 text-gray-700">
                    <p>
                      <span className="font-semibold">Số tài khoản:</span>{" "}
                      <span className="text-blue-600 font-bold">1234567890</span>
                    </p>
                    <p>
                      <span className="font-semibold">Ngân hàng:</span>{" "}
                      <span className="text-blue-600 font-bold">Vietcombank</span>
                    </p>
                    <p>
                      <span className="font-semibold">Chủ tài khoản:</span>{" "}
                      <span className="text-blue-600 font-bold">THƯ VIỆN SÁCH</span>
                    </p>
                    <p className="mt-3 pt-3 border-t border-yellow-300">
                      <span className="font-semibold">Nội dung chuyển khoản:</span>
                      <br />
                      <span className="text-red-600 font-bold text-lg">
                        Đền bù sách - {borrowing._id.slice(-6)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Ghi chú */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                Ghi chú (tùy chọn):
              </label>
              <textarea
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Nhập ghi chú về thanh toán..."
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                rows={4}
              />
            </div>

            {/* Lưu ý */}
            {paymentMethod === "cash" && (
              <div className="bg-blue-50 p-5 rounded-xl border-2 border-blue-200">
                <p className="text-sm text-blue-800 flex items-start gap-2">
                  <CheckCircle size={20} className="mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Lưu ý:</strong> Vui lòng thanh toán trực tiếp tại thư viện. Sau khi
                    thanh toán, đơn sẽ được cập nhật ngay lập tức.
                  </span>
                </p>
              </div>
            )}

            {paymentMethod === "bank" && (
              <div className="bg-yellow-50 p-5 rounded-xl border-2 border-yellow-200">
                <p className="text-sm text-yellow-800 flex items-start gap-2">
                  <CheckCircle size={20} className="mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Lưu ý:</strong> Sau khi chuyển khoản, vui lòng upload ảnh QR Code hoặc
                    ảnh chụp màn hình biên lai. Thanh toán sẽ được xác nhận bởi quản trị viên trong
                    vòng 24 giờ.
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Footer với nút hành động */}
          <div className="bg-gray-50 px-6 py-6 border-t flex flex-col sm:flex-row justify-between gap-4">
            <button
              onClick={() => navigate("/history")}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition font-semibold"
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Xác nhận thanh toán
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;

