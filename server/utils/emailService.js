import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, htmlContent) => {
  try {
    const user = process.env.EMAIL_USER || "thuvienlinova205@gmail.com";
    const pass = process.env.EMAIL_PASS || process.env.EMAIL_APP_PASSWORD;

    if (!user || !pass) {
      console.warn("⚠️ Thiếu cấu hình email (EMAIL_USER/EMAIL_PASS). Bỏ qua gửi email.");
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass, // Password ứng dụng 16 ký tự hoặc mật khẩu tương ứng
      },
    });

    await transporter.sendMail({
      from: `"📚 Linova Library" <${user}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log("📨 Email đã được gửi tới:", to);
  } catch (err) {
    console.error("❌ Lỗi gửi email:", err);
  }
};
