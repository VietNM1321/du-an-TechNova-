import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    passwordChangedAt: Date,

    role: {
      type: String,
      enum: ["client", "admin"],
      default: "client",
    },

    phone: {
      type: String,
      validate: {
        validator: (v) => /^\d{10}$/.test(v),
        message: (props) => `${props.value} không hợp lệ, vui lòng kiểm tra lại!`,
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
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
