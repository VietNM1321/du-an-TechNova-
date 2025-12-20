import { useSearchParams } from "react-router-dom";

export default function PaymentFail() {
  const [params] = useSearchParams();
  const message = params.get("message") || "Thanh toán không thành công. Vui lòng thử lại.";

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h2>❌ Thanh toán thất bại</h2>
      <p>{message}</p>
      <a href="/" style={{ display: 'inline-block', marginTop: 16 }}>Quay về trang chủ</a>
    </div>
  );
}
