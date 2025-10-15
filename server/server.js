import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import category from "./routes/category.js"
import Author from "./routes/author.js"
import cors from "cors";
import bookRoutes from "./routes/books.js";
import Reviews from "./routes/review.js";
import getPort from "get-port";
import authRoutes from "./routes/auth.js";
import corsMiddleware from './middleware/cors.js';
import authors from "./routes/author.js"

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(corsMiddleware);

app.use("/api/auth", authRoutes);
app.use("/api/authors",authors)
app.use("/api/books", bookRoutes);
app.use("/api/reviews", Reviews)
app.use("/api/author", Author);
app.use("/api/category", category);

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Kết nối Database thành công!");

    const port = process.env.PORT || 8019;

    app.listen(port, () => {
      console.log(`🚀 Server đang chạy trên cổng ${port}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
};

startServer();
