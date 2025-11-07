import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Thiếu token xác thực" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    req.user = decoded;
    const user = await User.findById(decoded.id).select("role active fullName email");
    if (!user) return res.status(401).json({ message: "Không tìm thấy người dùng" });
    if (user.active === false) return res.status(403).json({ message: "Tài khoản đã bị khóa" });
    req.currentUser = user;

    next();
  } catch (error) {
    console.error("Auth verifyToken error:", error);
    res.status(500).json({ message: "Lỗi xác thực" });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Chưa xác thực" });
    const currentRole = typeof req.user.role === "string"
      ? req.user.role.trim().toLowerCase()
      : req.user.role;
    const normalizedRoles = roles.map((role) =>
      typeof role === "string" ? role.trim().toLowerCase() : role
    );

    if (!normalizedRoles.includes(currentRole)) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    next();
  };
};

export const isSelfOrAdmin = (paramKey = "id") => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Chưa xác thực" });
    const role = typeof req.user.role === "string" ? req.user.role.trim().toLowerCase() : req.user.role;
    if (role === "admin") return next();
    if (req.user.id === req.params[paramKey]) return next();
    return res.status(403).json({ message: "Không có quyền thực hiện thao tác" });
  };
};


