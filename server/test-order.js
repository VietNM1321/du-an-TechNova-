import dotenv from "dotenv";
dotenv.config({ override: true });
import mongoose from "mongoose";
import Borrowing from "./models/borrowings.js";
import Payment from "./models/payment.js";
console.log("🔧 Environment variables:");
console.log("MONGO_URI:", process.env.MONGO_URI ? "✅" : "❌");
console.log("VNP_URL:", process.env.VNP_URL ? "✅" : "❌");
console.log("VNP_TMNCODE:", process.env.VNP_TMNCODE);
console.log("VNP_HASH_SECRET:", process.env.VNP_HASH_SECRET ? "✅" : "❌");
console.log("VNP_RETURN_URL:", process.env.VNP_RETURN_URL ? "✅" : "❌");
try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");
  const borrowing = await Borrowing.findOne().limit(1);
  console.log("📋 Sample Borrowing:", borrowing ? borrowing._id : "No borrowings found");
  await mongoose.disconnect();
  console.log("✅ Disconnected");
} catch (err) {
  console.error("❌ Error:", err.message);
  process.exit(1);
}