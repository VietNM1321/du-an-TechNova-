import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const responseRef = useRef(null);

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      setLoading(true);
      setResponse("");

      const res = await axios.post("http://localhost:5000/api/ai/chat", {
        message,
      });

      let aiText = res.data?.reply || "Không có phản hồi từ AI";

      // Xử lý các biểu thức toán học hợp lệ trong ngoặc (số TOÁN_TỬ số)
      aiText = aiText.replace(/\((\d+\s*[\+\-\*\/]\s*\d+)\)/g, (_, exp) => {
        try {
          const sanitized = exp.replace(/[^0-9+\-*/(). ]/g, "");
          const result = eval(sanitized);

          const operatorMap = { "+": "cộng", "-": "trừ", "*": "nhân", "/": "chia" };
          const parts = sanitized.split(/([+\-*/])/).map((p) => p.trim());

          if (parts.length === 3) {
            const [a, op, b] = parts;
            return `The result of the expression is:\nThe result of ${a} ${operatorMap[op]} ${b} bằng ${result} is **${result}**.\n\nSimple subtraction:\n${a} ${op} ${b} = ${result}`;
          }

          return `The result of the expression is:\nThe result of ${sanitized} bằng ${result} is **${result}**.\n\nSimple subtraction:\n${sanitized} = ${result}`;
        } catch (e) {
          // Nếu lỗi, giữ nguyên nội dung gốc
          return `(${exp})`;
        }
      });

      setResponse(aiText);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "❌ Lỗi khi gọi API AI";
      setResponse(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Tự động cuộn xuống cuối mỗi khi có phản hồi mới
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  return (
    <div
      className="fixed bottom-6 right-6 w-80 bg-white shadow-xl rounded-xl border border-gray-200"
      style={{ zIndex: 9999 }}
    >
      <div className="p-3 bg-blue-600 text-white rounded-t-xl flex justify-between items-center">
        <span className="font-semibold">AI Chat Bot</span>
      </div>

      <div className="p-3 flex flex-col">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Nhập tin nhắn..."
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 resize-none"
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          className={`w-full mt-2 py-2 rounded-lg text-white font-semibold ${
            loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Đang gửi..." : "Gửi"}
        </button>

        <h3 className="mt-3 font-semibold text-gray-600">Phản hồi:</h3>

        <div
          ref={responseRef}
          className="min-h-[80px] max-h-60 p-2 bg-gray-100 rounded-lg text-sm text-gray-800 whitespace-pre-wrap overflow-y-auto"
        >
          {response}
        </div>
      </div>
    </div>
  );
}
