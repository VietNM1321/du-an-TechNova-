import express from "express";
import multer from "multer";
import Notification from "../models/Notification.js"; // nhớ tạo model Notification.js
import path from "path";
import fs from "fs";

const router = express.Router();

// ========== CẤU HÌNH MULTER ==========
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = "uploads/notifications";
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + "-" + file.originalname.replace(/\s+/g, "_")
    );
  },
});

const upload = multer({ storage });

// ========== 🟢 TẠO THÔNG BÁO ==========
router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "wordFile", maxCount: 1 },
    { name: "excelFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, description, date } = req.body; // date được admin nhập thủ công (YYYY-MM-DD)
      const image = req.files?.image ? req.files.image[0].path : "";
      const wordFile = req.files?.wordFile ? req.files.wordFile[0].path : "";
      const excelFile = req.files?.excelFile ? req.files.excelFile[0].path : "";

      const newNotification = new Notification({
        title,
        description,
        date: date ? new Date(date) : new Date(), // dùng ngày admin nhập hoặc mặc định hôm nay
        image,
        wordFile,
        excelFile,
      });

      await newNotification.save();
      res.status(201).json(newNotification);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi khi tạo thông báo" });
    }
  }
);

// ========== 🔵 LẤY TẤT CẢ THÔNG BÁO ==========
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ date: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách thông báo" });
  }
});

// ========== 🟣 XEM CHI TIẾT THÔNG BÁO ==========
router.get("/:id", async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification)
      return res.status(404).json({ message: "Không tìm thấy thông báo" });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xem chi tiết thông báo" });
  }
});

// ========== 🟠 CẬP NHẬT THÔNG BÁO ==========
router.put(
  "/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "wordFile", maxCount: 1 },
    { name: "excelFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, description, date } = req.body;
      const notification = await Notification.findById(req.params.id);
      if (!notification)
        return res.status(404).json({ message: "Không tìm thấy thông báo" });

      // Cập nhật các trường cơ bản
      notification.title = title || notification.title;
      notification.description = description || notification.description;
      notification.date = date ? new Date(date) : notification.date;

      // Cập nhật file nếu có upload mới
      if (req.files?.image) notification.image = req.files.image[0].path;
      if (req.files?.wordFile)
        notification.wordFile = req.files.wordFile[0].path;
      if (req.files?.excelFile)
        notification.excelFile = req.files.excelFile[0].path;

      await notification.save();
      res.json(notification);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi cập nhật thông báo" });
    }
  }
);

// ========== 🔴 XÓA THÔNG BÁO ==========
router.delete("/:id", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification)
      return res.status(404).json({ message: "Không tìm thấy thông báo" });

    res.json({ message: "Đã xóa thông báo thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xóa thông báo" });
  }
});

export default router;
