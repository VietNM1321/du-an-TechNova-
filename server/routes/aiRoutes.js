import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import Book from "../models/books.js"; // Import model sách

dotenv.config();
const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ reply: "Vui lòng nhập nội dung." });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        reply: "AI chưa được cấu hình (thiếu OPENROUTER_API_KEY)"
      });
    }

    /* 1️⃣ LẤY DỮ LIỆU SÁCH TỪ DATABASE */
    let context = "Chưa lấy được dữ liệu sách từ hệ thống.";
    try {
      const books = await Book.find({}, "title author category description").limit(15).lean();
      if (books.length > 0) {
        context = `DANH SÁCH SÁCH TRONG HỆ THỐNG (${books.length} cuốn):\n` +
          books.map((b, i) => 
            `${i + 1}. Tên: ${b.title || "N/A"}\n   Tác giả: ${b.author || "N/A"}\n   Thể loại: ${b.category || "N/A"}\n   Mô tả: ${b.description || "N/A"}`
          ).join("\n\n");
      }
    } catch (dbErr) {
      console.warn("⚠️ Cảnh báo: Không thể kết nối database:", dbErr.message);
      context = "HỆ THỐNG: Database không khả dụng, AI sẽ trả lời dựa trên kiến thức chung về sách.";
    }

    /* 2️⃣ SYSTEM PROMPT CHO AI */
    const systemPrompt = `
Bạn là trợ lý AI của thư viện TechNova.

QUY TẮC TUYỆT ĐỐI:
- CHỈ trả lời dựa trên DỮ LIỆU HỆ THỐNG được cung cấp
- KHÔNG được dùng kiến thức bên ngoài hoặc suy đoán
- Nếu người dùng hỏi về gợi ý sách → CHỈ gợi ý từ danh sách hệ thống
- Nếu hệ thống không có dữ liệu → trả lời: "Xin lỗi, hệ thống hiện không có thông tin này. Vui lòng liên hệ thư viện."
- KHÔNG trả lời các câu hỏi ngoài lĩnh vực sách/thư viện
- Luôn trả lời bằng tiếng Việt
`;

    /* 3️⃣ GỌI OPENROUTER */
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `
DỮ LIỆU HỆ THỐNG:
${context}

NGƯỜI DÙNG HỎI:
${message}
`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    return res.json({
      reply: response.data.choices[0].message.content
    });

  } catch (err) {
    console.error("❌ AI Route Error:", err.message);
    return res.status(500).json({
      reply: "Lỗi server AI. Vui lòng thử lại sau."
    });
  }
});

export default router;
