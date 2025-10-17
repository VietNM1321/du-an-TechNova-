import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    studentCode: {
      type: String,
      unique: true,
      sparse: true, // ✅ tránh lỗi nếu có user không có studentCode
    },

    name: { type: String, default: "Chưa cập nhật" },

    email: { type: String, required: true, unique: true },

    password: { type: String, default: null },

    passwordChangedAt: Date,

    role: {
      type: String,
      enum: ["client", "admin", "student"],
      default: "client",
    },

    phone: {
      type: String,
      validate: {
        validator: (v) => !v || /^\d{10}$/.test(v),
        message: (props) =>
          `${props.value} không hợp lệ, vui lòng kiểm tra lại!`,
      },
    },

    addresses: [
      {
        street: String,
        city: String,
        isDefault: { type: Boolean, default: false },
      },
    ],

    avatar: String,

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
