import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // 🆔 Mã sinh viên (tùy chọn, có thể null với client)
    studentCode: {
      type: String,
      unique: true,
      sparse: true, // ✅ tránh lỗi nếu có user không có studentCode
    },

    // 👤 Tên sinh viên (hoặc khách hàng)
    fullName: { 
      type: String, 
      default: "Chưa cập nhật", 
      trim: true 
    },

    // 🏫 Khóa học (chỉ áp dụng cho sinh viên)
    course: { 
      type: String, 
      default: "Chưa cập nhật" 
    },

    // 📧 Email (bắt buộc)
    email: { 
      type: String, 
      required: true, 
      unique: true 
    },

    // 🔒 Mật khẩu (mặc định null nếu chưa cấp)
    password: { 
      type: String, 
      default: null 
    },

    passwordChangedAt: Date,

    // 🧩 Phân quyền người dùng
    role: {
      type: String,
      enum: ["client", "admin", "student"],
      default: "client",
    },

    // 📞 Số điện thoại
    phone: {
      type: String,
      validate: {
        validator: (v) => !v || /^\d{10}$/.test(v),
        message: (props) =>
          `${props.value} không hợp lệ, vui lòng kiểm tra lại!`,
      },
    },

    // 🏠 Địa chỉ (có thể nhiều)
    addresses: [
      {
        street: String,
        city: String,
        isDefault: { type: Boolean, default: false },
      },
    ],

    // 🖼️ Ảnh đại diện
    avatar: String,

    // 🚫 Trạng thái hoạt động
    active: {
      type: Boolean,
      default: true,
      select: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
