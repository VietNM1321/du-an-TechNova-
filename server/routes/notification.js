import express from "express";
import multer from "multer";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import fs from "fs";
import path from "path";

const router = express.Router();

// ─── Multer config ─────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = "uploads/notifications";
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, Date.now() + "-" + safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid file type"), false);
  },
});

const normalizePath = (filePath) => filePath.replace(/\\/g, "/");

// ─── GET all notifications ─────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate("userId", "studentCode fullName email")
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi lấy danh sách thông báo" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id).populate(
      "userId",
      "studentCode fullName email"
    );
    if (!notification)
      return res.status(404).json({ message: "Không tìm thấy thông báo" });
    res.json(notification);
  } catch (err) {
    console.error("GET /notifications/:id error:", err);
    res.status(500).json({ message: "Lỗi khi lấy thông báo", error: err.message });
  }
});
// ─── CREATE new notification ───────────────────────────────────────
router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "wordFile", maxCount: 1 },
    { name: "excelFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      let { title, message: msg, type, studentCode, date } = req.body;
      let userId = null;

      if (type === "reminder") {
        if (!studentCode)
          return res.status(400).json({ message: "studentCode bắt buộc với reminder" });

        const user = await User.findOne({ studentCode });
        if (!user) return res.status(404).json({ message: "Không tìm thấy sinh viên" });

        userId = user._id;
      }

      const newNotification = new Notification({
        title,
        message: msg,
        type,
        ...(userId && { userId }),
        createdAt: date ? new Date(date) : new Date(),
        data: {
          image: req.files?.image?.[0] ? normalizePath(req.files.image[0].path) : null,
          wordFile: req.files?.wordFile?.[0] ? normalizePath(req.files.wordFile[0].path) : null,
          excelFile: req.files?.excelFile?.[0] ? normalizePath(req.files.excelFile[0].path) : null,
        },
      });

      await newNotification.save();
      const populated = await newNotification.populate("userId", "studentCode fullName email");
      res.status(201).json(populated);
    } catch (err) {
      console.error("POST /notifications error:", err);
      res.status(500).json({ message: "Lỗi khi tạo thông báo", error: err.message });
    }
  }
);

// ─── UPDATE notification ──────────────────────────────────────────
router.put(
  "/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "wordFile", maxCount: 1 },
    { name: "excelFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, message, type, studentCode, date } = req.body;
      const notification = await Notification.findById(req.params.id);
      if (!notification) return res.status(404).json({ message: "Không tìm thấy thông báo" });

      let userId = null;
      if (type === "reminder" && studentCode) {
        const user = await User.findOne({ studentCode });
        if (!user) return res.status(404).json({ message: "Không tìm thấy sinh viên" });
        userId = user._id;
      }

      notification.title = title || notification.title;
      notification.message = message || notification.message;
      notification.type = type || notification.type;
      notification.userId = type === "reminder" ? userId : null;
      notification.createdAt = date ? new Date(date) : notification.createdAt;

      notification.data = notification.data || {};
      if (req.files?.image) notification.data.image = normalizePath(req.files.image[0].path);
      if (req.files?.wordFile) notification.data.wordFile = normalizePath(req.files.wordFile[0].path);
      if (req.files?.excelFile) notification.data.excelFile = normalizePath(req.files.excelFile[0].path);

      await notification.save();
      const populated = await notification.populate("userId", "studentCode fullName email");
      res.json(populated);
    } catch (err) {
      console.error("PUT /notifications/:id error:", err);
      res.status(500).json({ message: "Lỗi khi cập nhật thông báo", error: err.message });
    }
  }
);

// ─── DELETE notification ──────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: "Không tìm thấy thông báo" });

    // Xóa file nếu có
    ["image", "wordFile", "excelFile"].forEach((key) => {
      if (notification.data?.[key]) {
        const filePath = path.join(process.cwd(), notification.data[key]);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    });

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa thông báo thành công" });
  } catch (err) {
    console.error("DELETE /notifications/:id error:", err);
    res.status(500).json({ message: "Lỗi khi xóa thông báo" });
  }
});

export default router;
