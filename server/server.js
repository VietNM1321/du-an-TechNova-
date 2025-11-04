import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import getPort from "get-port";

// Import các route
import categoryRoutes from "./routes/category.js";
import authorRoutes from "./routes/author.js";
import bookRoutes from "./routes/books.js";
<<<<<<< HEAD
=======
import importWarehouseRoutes from "./routes/importWarehouse.js";
>>>>>>> origin/main
import reviewRoutes from "./routes/review.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/userRoutes.js";
import borrowings from "./routes/borrowings.js";
import cartRoutes from "./routes/cart.js";
import bookcodeRoutes from "./routes/bookcode.js";
import courseRoutes from "./routes/courseRoutes.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/books", bookRoutes);
<<<<<<< HEAD
=======
app.use("/api/imports", importWarehouseRoutes);
>>>>>>> origin/main
app.use("/api/borrowings", borrowings);
app.use("/api/bookcodes", bookcodeRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/courses", courseRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Không tìm thấy đường dẫn: ${req.originalUrl}` });
});
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
