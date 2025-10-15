import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/connectdb.js";

// Các routes
import authorRoutes from "./routes/author.js";
import categoryRoutes from "./routes/category.js";
import genreRoutes from "./routes/genre.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js"; // 🔹 thêm dòng này

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());


connectDB();


app.use("/auth", authRoutes);
app.use("/authors", authorRoutes);
app.use("/categories", categoryRoutes);
app.use("/genres", genreRoutes);
app.use("/users", userRoutes); 

app.get("/", (req, res) => {
  res.send("✅ Server đang chạy tốt!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`)
);
