import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import getPort from "get-port";
import corsMiddleware from "./middleware/cors.js";
import category from "./routes/category.js";
import authors from "./routes/author.js";
import bookRoutes from "./routes/books.js";
import reviews from "./routes/review.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/userRoutes.js";
import cartRouter from "./routes/cart.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(corsMiddleware);
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/authors", authors);
app.use("/api/books", bookRoutes);
app.use("/api/cart", cartRouter);
app.use("/api/reviews", reviews);
app.use("/api/users", userRoutes);
app.use("/api/category", category);
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Kết nối Database thành công!");

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`🚀 Server đang chạy trên cổng ${port}`);
    });
  } catch (err) {
    console.error("❌ Kết nối MongoDB thất bại:", err);
    process.exit(1);
  }
};

startServer();
