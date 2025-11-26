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

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",  // Địa chỉ Api của openrouter
      {
        model: "deepseek/deepseek-r1",   // Bạn có thể đổi model nếu muốn
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "TechNova AI",
          "Content-Type": "application/json",
        },
      }
    );

    const reply =
      response.data?.choices?.[0]?.message?.content ||
      "⚠ AI không trả về nội dung.";

    return res.json({ reply });
  } catch (err) {
    console.error("❌ Lỗi AI:", err.response?.data || err.message);

    return res.status(500).json({
      error: "AI request failed",
      detail: err.response?.data || err.message,
    });
  }
});

export default router;
