import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [detail, setDetail] = useState(null);
  useEffect(() => {
    const txnRef = searchParams.get("vnp_TxnRef") || searchParams.get("vnp_TxnRef") || searchParams.get("txnRef");
    if (!txnRef) {
      setStatus("error");
      return;
    }
    const verify = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/vnpay/verify?txnRef=${encodeURIComponent(txnRef)}`);
        const payload = res.data || {};
        setDetail(payload);
        const paid = payload.payment?.status === "paid" || payload.borrowing?.paymentStatus === "completed";
        setStatus(paid ? "success" : "failed");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };
    verify();
  }, [searchParams]);
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {status === "loading" && <div>Đang kiểm tra giao dịch...</div>}
        {status === "success" && (
          <div>
            <h2 className="text-2xl font-bold text-green-600">Thanh toán thành công 🎉</h2>
            <p className="mt-4">Cảm ơn bạn. Đơn mượn đã được cập nhật.</p>
            <button onClick={() => navigate("/")} className="mt-6 px-6 py-3 bg-blue-600 text-white rounded">Quay về trang chủ</button>
          </div>
        )}
        {status === "failed" && (
          <div>
            <h2 className="text-2xl font-bold text-red-600">Thanh toán chưa thành công</h2>
            <p className="mt-4">Vui lòng kiểm tra lại hoặc liên hệ admin.</p>
            <button onClick={() => navigate(-1)} className="mt-6 px-6 py-3 bg-gray-200 rounded">Quay lại</button>
          </div>
        )}
        {status === "error" && (
          <div>
            <h2 className="text-2xl font-bold text-red-600">Lỗi</h2>
            <p className="mt-4">Không tìm thấy giao dịch để kiểm tra.</p>
            <button onClick={() => navigate(-1)} className="mt-6 px-6 py-3 bg-gray-200 rounded">Quay lại</button>
          </div>
        )}
      </div>
    </div>
  );
};
export default PaymentResult;