import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Thiếu message" });
    }

    // Kiểm tra API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    console.log("📍 API Key exists:", !!apiKey);
    
    if (!apiKey || apiKey === "your_openrouter_api_key_here" || apiKey === "sk_live_xxxxxxxxxxxxx") {
      console.warn("⚠️ Cảnh báo: OPENROUTER_API_KEY không được cấu hình đúng");
      return res.status(503).json({
        error: "AI service unavailable",
        detail: "OPENROUTER_API_KEY is not properly configured",
        message: "Tính năng AI chat chưa được cấu hình. Vui lòng liên hệ quản trị viên."
      });
    }

    console.log("📍 Sending request to OpenRouter with model: gpt-3.5-turbo");
    
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo", // Model phổ biến hơn và ổn định
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
        timeout: 30000, // 30 giây timeout
      }
    );

    console.log("✅ Response received from OpenRouter");
    
    const reply =
      response.data?.choices?.[0]?.message?.content ||
      "⚠ AI không trả về nội dung.";

    return res.json({ reply });
  } catch (err) {
    console.error("❌ Lỗi AI Chi tiết:", {
      message: err.message,
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      url: err.config?.url,
    });

    return res.status(500).json({
      error: "AI request failed",
      detail: err.response?.data?.error || err.message,
    });
  }
});

export default router;
