import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import categoryRoutes from "./routes/category.js";
import authorRoutes from "./routes/author.js";
import genreRoutes from "./routes/genre.js";

const app = express();

app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect("mongodb://localhost:27017/du_an_technova")
  .then(() => console.log("✅ Kết nối MongoDB thành công"))
  .catch((err) => console.error("❌ Lỗi MongoDB:", err));

// Đăng ký routes
app.use("/api/categories", categoryRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/genres", genreRoutes);

// Route mặc định
app.get("/", (req, res) => {
  res.send("Server đang chạy!");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`));
