import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const borrowId = params.get("borrowId");

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
        
        <CheckCircle className="mx-auto text-green-500" size={72} />

        <h2 className="text-2xl font-bold text-gray-800 mt-4">
          Thanh toán thành công
        </h2>

        <p className="text-gray-600 mt-2">
          Giao dịch của bạn đã được xử lý thành công.
        </p>

        <div className="bg-gray-100 rounded-lg p-4 mt-6">
          <p className="text-sm text-gray-500">Mã đơn mượn</p>
          <p className="text-lg font-semibold text-gray-800">
            {borrowId || "Không xác định"}
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <Link
            to="/"
            className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            Trang chủ
          </Link>

          <Link
            to="/history"
            className="flex-1 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
          >
            Đơn của tôi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;