import express from "express";
import Cart from "../models/cart.js";
import Book from "../models/books.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "Cần userId" });

    let cart = await Cart.findOne({ userId }).populate("items.bookId", "title images price");

    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
      cart = await Cart.findById(cart._id).populate("items.bookId", "title images price");
    }


    cart.items = cart.items.filter(i => i.bookId !== null);

    res.json(cart);
  } catch (error) {
    console.error("❌ Lỗi GET /cart:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

router.post("/add", async (req, res) => {
  try {
    const {
      userId,
      bookId,
      quantity = 1,
      fullName,
      studentId,
      email,
      borrowDate,
      returnDate,
    } = req.body;

    if (!userId || !bookId) return res.status(400).json({ message: "Thiếu userId hoặc bookId" });

    let cart = await Cart.findOne({ userId }) || new Cart({ userId, items: [] });

    const existingItem = cart.items.find(i => i.bookId.toString() === bookId);

    if (existingItem) {
      existingItem.quantity += Number(quantity);
      existingItem.fullName = fullName;
      existingItem.studentId = studentId;
      existingItem.email = email;
      existingItem.borrowDate = borrowDate;
      existingItem.returnDate = returnDate;
    } else {
      cart.items.push({
        bookId,
        quantity: Number(quantity),
        fullName,
        studentId,
        email,
        borrowDate,
        returnDate,
      });
    }

    await cart.save();
    const populated = await Cart.findById(cart._id).populate("items.bookId", "title images price");
    res.json(populated);
  } catch (error) {
    console.error("❌ Lỗi POST /cart/add:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

router.put("/update", async (req, res) => {
  try {
    const { userId, bookId, quantity } = req.body;
    if (!userId || !bookId) return res.status(400).json({ message: "Thiếu dữ liệu" });

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Không có giỏ hàng" });

    const item = cart.items.find(i => i.bookId && i.bookId.toString() === bookId);
    if (!item) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    if (quantity <= 0) cart.items = cart.items.filter(i => i.bookId.toString() !== bookId);
    else item.quantity = Number(quantity);

    await cart.save();
    const populated = await Cart.findById(cart._id).populate("items.bookId", "title images price");
    res.json(populated);
  } catch (error) {
    console.error("❌ Lỗi PUT /cart/update:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

router.delete("/remove", async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    if (!userId || !bookId) return res.status(400).json({ message: "Thiếu dữ liệu" });

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Không có giỏ hàng" });

    cart.items = cart.items.filter(i => i.bookId && i.bookId.toString() !== bookId);
    await cart.save();

    const populated = await Cart.findById(cart._id).populate("items.bookId", "title images price");
    res.json(populated);
  } catch (error) {
    console.error("❌ Lỗi DELETE /cart/remove:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

router.delete("/clear", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "Cần userId" });

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Không có giỏ hàng" });

    cart.items = [];
    await cart.save();

    const populated = await Cart.findById(cart._id).populate("items.bookId", "title images price");
    res.json(populated);
  } catch (error) {
    console.error("❌ Lỗi DELETE /cart/clear:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

export default router;
