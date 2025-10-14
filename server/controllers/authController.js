import bcrypt from "bcryptjs";
import User from "../models/User.js";

// ✅ Hàm cấp lại mật khẩu
export const setPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Mật khẩu không được để trống" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.status(200).json({ message: "Cấp mật khẩu thành công!", user });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật mật khẩu:", error);
    res.status(500).json({ message: "Lỗi máy chủ", error });
  }
};
