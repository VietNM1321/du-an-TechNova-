import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import getPort from "get-port";
import corsMiddleware from "./middleware/cors.js";

// 🟢 Import các route
import categoryRoutes from "./routes/category.js";
import authorRoutes from "./routes/author.js";
import bookRoutes from "./routes/books.js";
import reviewRoutes from "./routes/review.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/userRoutes.js";
import cartRoutes from "./routes/cart.js";
import bookcodeRoutes from "./routes/bookcode.js";
import courseRoutes from "./routes/courseRoutes.js"; // ✅ Đảm bảo file này tồn tại

// 🧩 Cấu hình cơ bản
dotenv.config();
const app = express();

// 🧠 Middleware
app.use(cors());
app.use(express.json());
app.use(corsMiddleware);
app.use("/uploads", express.static("uploads"));

// 🛣 Định tuyến API
app.use("/api/auth", authRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/bookcode", bookcodeRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/courses", courseRoutes); // ✅ Đường dẫn đúng cho khóa học

// 🧭 Kiểm tra route 404 (bắt mọi request sai đường)
app.use((req, res) => {
  res.status(404).json({ message: `Không tìm thấy đường dẫn: ${req.originalUrl}` });
});

// 🚀 Khởi chạy server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Kết nối Database thành công!");

    const port = process.env.PORT || (await getPort({ port: 5000 }));
    app.listen(port, () => {
      console.log(`🚀 Server đang chạy trên cổng ${port}`);
    });
  } catch (err) {
    console.error("❌ Kết nối MongoDB thất bại:", err);
    process.exit(1);
  }
};

startServer();
