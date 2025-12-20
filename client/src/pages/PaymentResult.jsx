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
    console.log('📋 Payment result page loaded');
    console.log('   txnRef:', txnRef);
    console.log('   query params:', Object.fromEntries([...searchParams]));
    if (!txnRef) {
      console.error('   ❌ No txnRef found!');
      setStatus("error");
      return;
    }
    const verify = async () => {
      try {
        console.log('🔄 Calling /vnpay/verify...');
        // Pass all vnp_* params to verify endpoint for signature validation
        const params = new URLSearchParams(searchParams);
        const verifyUrl = `http://localhost:5000/vnpay/verify?${params.toString()}`;
        console.log('   Request URL:', verifyUrl);
        const res = await axios.get(verifyUrl);
        const payload = res.data || {};
        console.log('✅ vnpay verify response:', payload);
        setDetail(payload);
        const paidByServer = payload.payment?.status === "paid" || payload.borrowing?.paymentStatus === "completed" || payload.ok === true;
        const vnpResponseCode = searchParams.get('vnp_ResponseCode');
        const vnpTxnStatus = searchParams.get('vnp_TransactionStatus');
        const paidByParams = vnpResponseCode === '00' || vnpTxnStatus === '00';
        console.log('   paidByServer:', paidByServer, '(ok=', payload.ok, ', payment.status=', payload.payment?.status, ', borrowing.paymentStatus=', payload.borrowing?.paymentStatus, ')');
        console.log('   paidByParams:', paidByParams, '(ResponseCode=', vnpResponseCode, ', TxnStatus=', vnpTxnStatus, ')');
        setStatus(paidByServer || paidByParams ? "success" : "failed");
      } catch (err) {
        console.error('❌ Error in verify:', err);
        setStatus("error");
        setDetail(err.response?.data || { error: err.message });
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
            <details className="text-left mt-4 p-2 bg-gray-50 rounded text-sm">
              <summary className="cursor-pointer">Xem chi tiết verify</summary>
              <pre className="whitespace-pre-wrap break-words mt-2">{JSON.stringify(detail, null, 2)}</pre>
              <p className="mt-2">Query params: <code>{JSON.stringify(Object.fromEntries([...searchParams]))}</code></p>
            </details>
            <button onClick={() => navigate(-1)} className="mt-6 px-6 py-3 bg-gray-200 rounded">Quay lại</button>
          </div>
        )}
        {status === "error" && (
          <div>
            <h2 className="text-2xl font-bold text-red-600">Lỗi</h2>
            <p className="mt-4">Không tìm thấy giao dịch để kiểm tra.</p>
            <details className="text-left mt-4 p-2 bg-gray-50 rounded text-sm">
              <summary className="cursor-pointer">Xem chi tiết verify</summary>
              <pre className="whitespace-pre-wrap break-words mt-2">{JSON.stringify(detail, null, 2)}</pre>
              <p className="mt-2">Query params: <code>{JSON.stringify(Object.fromEntries([...searchParams]))}</code></p>
            </details>
            <button onClick={() => navigate(-1)} className="mt-6 px-6 py-3 bg-gray-200 rounded">Quay lại</button>
          </div>
        )}
      </div>
    </div>
  );
};
export default PaymentResult;