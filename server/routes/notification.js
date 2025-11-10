import express from "express";
import multer from "multer";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import fs from "fs";

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = "uploads/notifications";
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});
const upload = multer({ storage });
const normalizePath = (filePath) => filePath.replace(/\\/g, "/");

// 🔹 Lấy danh sách tất cả thông báo
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi lấy danh sách thông báo" });
  }
});

// 🟢 Tạo thông báo
router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "wordFile", maxCount: 1 },
    { name: "excelFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      let { title, message: msg, type, userId, studentCode, date } = req.body;

      if (type === "reminder") {
        if (!studentCode) return res.status(400).json({ message: "studentCode bắt buộc với reminder" });
        const user = await User.findOne({ studentCode });
        if (!user) return res.status(404).json({ message: "Không tìm thấy sinh viên với mã này" });
        userId = user._id;
      }

      if (!userId) return res.status(400).json({ message: "userId hoặc studentCode là bắt buộc" });

      const newNotification = new Notification({
        title,
        message: msg,
        type,
        userId,
        createdAt: date ? new Date(date) : new Date(),
        data: {
          image: req.files?.image ? normalizePath(req.files.image[0].path) : "",
          wordFile: req.files?.wordFile ? normalizePath(req.files.wordFile[0].path) : "",
          excelFile: req.files?.excelFile ? normalizePath(req.files.excelFile[0].path) : "",
        },
      });

      await newNotification.save();
      res.status(201).json(newNotification);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi khi tạo thông báo", error: err.message });
    }
  }
);

// 🟣 Xem chi tiết
router.get("/:id", async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: "Không tìm thấy thông báo" });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xem chi tiết thông báo" });
  }
});

// 🟠 Cập nhật
router.put(
  "/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "wordFile", maxCount: 1 },
    { name: "excelFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, message, type } = req.body;
      const notification = await Notification.findById(req.params.id);
      if (!notification) return res.status(404).json({ message: "Không tìm thấy thông báo" });

      notification.title = title || notification.title;
      notification.message = message || notification.message;
      notification.type = type || notification.type;

      notification.data = notification.data || {};
      if (req.files?.image) notification.data.image = normalizePath(req.files.image[0].path);
      if (req.files?.wordFile) notification.data.wordFile = normalizePath(req.files.wordFile[0].path);
      if (req.files?.excelFile) notification.data.excelFile = normalizePath(req.files.excelFile[0].path);

      await notification.save();
      res.json(notification);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi cập nhật thông báo" });
    }
  }
);

// 🔴 Xóa
router.delete("/:id", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ message: "Không tìm thấy thông báo" });
    res.json({ message: "Đã xóa thông báo thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xóa thông báo" });
  }
});

export default router;
