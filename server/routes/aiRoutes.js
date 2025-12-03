import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const router = express.Router();
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || message.trim() === "") {
      return res.status(400).json({ 
        error: "Thiếu message",
        message: "Vui lòng nhập tin nhắn để chat với AI."
      });
    }
    const apiKey = process.env.OPENROUTER_API_KEY?.trim();
    console.log("📍 API Key exists:", !!apiKey);
    console.log("📍 API Key length:", apiKey ? apiKey.length : 0);
    console.log("📍 API Key starts with:", apiKey ? apiKey.substring(0, Math.min(15, apiKey.length)) : "N/A");
    
    if (!apiKey || 
        apiKey === "your_openrouter_api_key_here" || 
        apiKey === "sk_live_xxxxxxxxxxxxx" ||
        apiKey === "sk-or-v1-your-api-key-here") {
      console.warn("⚠️ Cảnh báo: OPENROUTER_API_KEY không được cấu hình đúng");
      console.warn("📝 Hướng dẫn: Tạo file .env trong thư mục server/ và thêm:");
      console.warn("   OPENROUTER_API_KEY=sk-or-v1-your-actual-key");
      console.warn("   Đăng ký API key tại: https://openrouter.ai/");
      return res.status(503).json({
        error: "AI service unavailable",
        message: "Tính năng AI chat chưa được cấu hình. Vui lòng kiểm tra file .env và cấu hình OPENROUTER_API_KEY.",
        detail: "OPENROUTER_API_KEY is not properly configured",
        help: "Đăng ký API key tại https://openrouter.ai/ và thêm vào file server/.env"
      });
    }
    
    // Kiểm tra format API key (OpenRouter API key thường bắt đầu bằng "sk-or-v1-")
    if (!apiKey.startsWith("sk-or-v1-") && !apiKey.startsWith("sk-or-")) {
      console.warn("⚠️ Cảnh báo: API Key có thể không đúng format. OpenRouter key thường bắt đầu bằng 'sk-or-v1-' hoặc 'sk-or-'");
    }
    console.log("📍 Sending request to OpenRouter with model: gpt-3.5-turbo");
    console.log("📍 Message length:", message.length);
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: message,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "TechNova AI",
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );
      console.log("✅ Response received from OpenRouter");
      console.log("📍 Response status:", response.status);
      
      const reply =
        response.data?.choices?.[0]?.message?.content ||
        "⚠ AI không trả về nội dung.";
      return res.json({ reply });
    } catch (axiosError) {
      console.error("❌ Axios Error:", {
        message: axiosError.message,
        code: axiosError.code,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
      });
      let errorMessage = "Lỗi khi kết nối với dịch vụ AI";
      let statusCode = 500;
      
      if (axiosError.response) {
        const errorData = axiosError.response.data;
        statusCode = axiosError.response.status;
        
        // Xử lý lỗi 401 Unauthorized - API key không hợp lệ
        if (statusCode === 401) {
          errorMessage = "API key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại OPENROUTER_API_KEY trong file .env";
          console.error("❌ API Key Error - 401 Unauthorized");
          console.error("📍 Error details:", JSON.stringify(errorData, null, 2));
        } else if (errorData?.error?.message) {
          errorMessage = errorData.error.message;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else {
          errorMessage = `Lỗi từ dịch vụ AI: ${axiosError.response.status} ${axiosError.response.statusText}`;
        }
      } else if (axiosError.request) {
        errorMessage = "Không nhận được phản hồi từ dịch vụ AI. Vui lòng kiểm tra kết nối mạng.";
      } else if (axiosError.code === 'ECONNABORTED') {
        errorMessage = "Yêu cầu quá thời gian chờ. Vui lòng thử lại.";
      }
      
      return res.status(statusCode).json({
        error: statusCode === 401 ? "Unauthorized" : "AI request failed",
        message: errorMessage,
        detail: axiosError.message || "Unknown error",
        statusCode: statusCode
      });
    }
  } catch (err) {
    console.error("❌ Unexpected Error:", {
      message: err.message,
      stack: err.stack,
    });
    return res.status(500).json({
      error: "Internal server error",
      message: "Đã xảy ra lỗi không mong đợi. Vui lòng thử lại sau.",
      detail: err.message || "Unknown error"
    });
  }
});
export default router;