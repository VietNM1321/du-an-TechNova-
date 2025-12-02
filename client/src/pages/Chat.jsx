import { useState } from "react";
import axios from "axios";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      setLoading(true);
      setResponse("");

      const res = await axios.post("http://localhost:5000/api/ai/chat", {
        message,
      });

      // Giả sử backend trả về { reply: "..." }
      let aiText = res.data?.reply || "Không có phản hồi từ AI";

      // Nếu AI trả về dạng toán học với LaTeX, chúng ta xử lý thành tiếng Việt
      // Ví dụ: thay "5 - 2" bằng "Năm trừ hai bằng ba"
      aiText = aiText
        .replace(/\\\((.*?)\\\)/g, (_, exp) => {
          try {
            // Tính toán biểu thức nếu đơn giản
            // Chỉ hỗ trợ +, -, *, /
            const sanitized = exp.replace(/[^0-9+\-*/(). ]/g, "");
            // eslint-disable-next-line no-eval
            const result = eval(sanitized);
            // Chuyển sang tiếng Việt
            const operatorMap = {
              "+": "cộng",
              "-": "trừ",
              "*": "nhân",
              "/": "chia",
            };
            const parts = sanitized.split(/([+\-*/])/).map((p) => p.trim());
            if (parts.length === 3) {
              const [a, op, b] = parts;
              return `${numberToVietnamese(a)} ${operatorMap[op]} ${numberToVietnamese(b)} bằng ${numberToVietnamese(result)}`;
            }
            return `${sanitized} = ${result}`;
          } catch (e) {
            return exp;
          }
        });

      setResponse(aiText);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || 
                       err.response?.data?.detail || 
                       "❌ Lỗi khi gọi API AI";
      setResponse(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Chuyển số thành chữ tiếng Việt đơn giản
  const numberToVietnamese = (num) => {
    const numbers = ["không","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];
    const n = parseInt(num);
    if (!isNaN(n) && n >= 0 && n <= 20) return numbers[n] || num;
    return num;
  };

  return (
    <div className="max-w-xl mx-auto p-4 mt-8 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">AI Chat Bot</h1>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Nhập tin nhắn..."
        rows={4}
        className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <button
        onClick={sendMessage}
        disabled={loading}
        className={`w-full py-3 rounded-lg text-white font-semibold transition ${
          loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Đang gửi..." : "Gửi"}
      </button>

      <h3 className="mt-6 mb-2 font-semibold text-gray-700">Phản hồi:</h3>

      <div className="min-h-[100px] p-4 bg-gray-100 rounded-lg whitespace-pre-wrap text-gray-800">
        {response}
      </div>
    </div>
  );
}

