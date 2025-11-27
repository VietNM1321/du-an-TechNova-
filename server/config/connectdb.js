import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("Đã kết nối MongoDB trước đó.");
    return;
  }

  try {
    const mongoUri = process.env.MONGO_URI;
    console.log("👉 Mongo URI:", mongoUri);

    await mongoose.connect(mongoUri, {
      dbName: process.env.DATABASE_NAME,
    });
    isConnected = true;
    console.log("✅ Kết nối MongoDB thành công.");
  } catch (error) {
    console.error("❌ Lỗi kết nối MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;
