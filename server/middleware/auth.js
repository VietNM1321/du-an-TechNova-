import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    console.log("📍 Authorization header:", authHeader);
    
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      console.log("❌ Token missing");
      return res.status(401).json({ message: "Thiếu token xác thực" });
    }

    console.log("✅ Token found, JWT_SECRET:", process.env.JWT_SECRET ? "SET" : "NOT SET");

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token verified successfully. Decoded:", decoded);
    } catch (err) {
      console.error("❌ Token verification failed:", err.message);
      return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    req.user = decoded;
    console.log("📍 Looking up user with id:", decoded.id);
    
    const user = await User.findById(decoded.id).select("role active fullName email");
    if (!user) {
      console.error("❌ User not found for id:", decoded.id);
      return res.status(401).json({ message: "Không tìm thấy người dùng" });
    }
    
    if (user.active === false) {
      console.error("❌ User account is deactivated:", decoded.id);
      return res.status(403).json({ message: "Tài khoản đã bị khóa" });
    }
    
    req.currentUser = user;
    console.log("✅ Auth verified successfully for user:", user.email);
    next();
  } catch (error) {
    console.error("❌ Auth verifyToken error:", error);
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
    console.log("📍 isSelfOrAdmin check - paramKey:", paramKey);
    console.log("📍 req.user:", req.user);
    console.log("📍 req.params[paramKey]:", req.params[paramKey]);
    
    if (!req.user) {
      console.error("❌ No req.user found");
      return res.status(401).json({ message: "Chưa xác thực" });
    }
    
    const role = typeof req.user.role === "string" ? req.user.role.trim().toLowerCase() : req.user.role;
    console.log("📍 User role:", role);
    
    if (role === "admin") {
      console.log("✅ User is admin, allowing access");
      return next();
    }
    
    if (req.user.id === req.params[paramKey]) {
      console.log("✅ User accessing own resource, allowing access");
      return next();
    }
    
    console.error("❌ Access denied - user cannot access this resource");
    return res.status(403).json({ message: "Không có quyền thực hiện thao tác" });
  };
};


