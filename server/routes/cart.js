import express from "express";
import Cart from "../models/cart.js";
import Book from "../models/books.js";
import Borrowing from "../models/borrowings.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();
router.get("/", verifyToken, async (req, res) => {
  try {
    console.log("📍 GET /api/cart - req.user:", req.user);
    const userId = req.user?.id;
    if (!userId) {
      console.error("❌ userId is empty. req.user:", req.user);
      return res.status(401).json({ message: "Chưa xác thực" });
    }
    console.log("✅ Fetching cart for userId:", userId);
    
    let cart = await Cart.findOne({ userId }).populate({
      path: "items.bookId",
      select: "title images author",
      populate: { path: "author", select: "name" }
    });

    if (!cart) {
      console.log("📍 Cart not found, creating new cart for userId:", userId);
      cart = await Cart.create({ userId, items: [] });
      cart = await Cart.findById(cart._id).populate({
        path: "items.bookId",
        select: "title images author",
        populate: { path: "author", select: "name" }
      });
    }
    cart.items = cart.items.filter(i => i.bookId !== null);
    res.json(cart);
  } catch (error) {
    console.error("❌ Lỗi GET /cart:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});
router.post("/add", verifyToken, async (req, res) => {
  try {
    const {bookId,quantity = 1,fullName,studentId,email,borrowDate,returnDate,} = req.body;
    const userId = req.user?.id;
    if (!userId || !bookId) return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" })
    const unpaidLostBook = await Borrowing.findOne({
      user: userId,
      status: "lost",
      $or: [
        { paymentStatus: { $ne: "completed" } },
        { paymentStatus: { $exists: false } }
      ]
    }).populate("book", "title");

    if (unpaidLostBook) {
      const bookTitle = unpaidLostBook.book?.title || unpaidLostBook.bookSnapshot?.title || "một cuốn sách";
      return res.status(400).json({ 
        message: `Bạn có sách "${bookTitle}" bị mất chưa thanh toán. Vui lòng hoàn tất thanh toán trước khi mượn sách khác!` 
      });
    }
    const activeBorrowing = await Borrowing.findOne({
      user: userId,
      status: { $in: ["borrowed", "renewed", "pendingPickup", "overdue"] }
    }).populate("book", "title");
    if (activeBorrowing) {
      const bookTitle = activeBorrowing.book?.title || activeBorrowing.bookSnapshot?.title || "một cuốn sách";
      const statusLabels = {
        borrowed: "đang mượn",
        renewed: "đã gia hạn (đang mượn)",
        pendingPickup: "chưa lấy sách",
        overdue: "quá hạn"
      };
      const statusLabel = statusLabels[activeBorrowing.status] || activeBorrowing.status;
      return res.status(400).json({ 
        message: `Bạn đang có sách "${bookTitle}" ở trạng thái "${statusLabel}" chưa trả. Vui lòng trả sách trước khi mượn sách khác!` 
      });
    }
    const lostOrDamagedBorrowing = await Borrowing.findOne({
      user: userId,
      book: bookId,
      status: { $in: ["lost", "damaged"] },
      $or: [
        { paymentStatus: { $ne: "completed" } },
        { paymentStatus: { $exists: false } }
      ]
    });

    if (lostOrDamagedBorrowing) {
      const statusLabels = {
        lost: "mất",
        damaged: "hỏng"
      };
      const statusLabel = statusLabels[lostOrDamagedBorrowing.status] || lostOrDamagedBorrowing.status;
      return res.status(400).json({ 
        message: `Bạn đã mượn cuốn sách này và sách đã bị ${statusLabel}. Vui lòng hoàn tất thanh toán trước khi mượn lại!` 
      });
    }
    const activeBorrowingUserBook  = await Borrowing.findOne({
      user: userId,
      book: bookId,
      status: { $in: ["borrowed", "renewed", "pendingPickup"] }
    });

    if (activeBorrowingUserBook ) {
      const statusLabels = {
        borrowed: "đang mượn",
        renewed: "đã gia hạn (đang mượn)",
        pendingPickup: "chưa lấy sách"
      };
      const statusLabel = statusLabels[activeBorrowingUserBook .status] || activeBorrowingUserBook .status;
      return res.status(400).json({ 
        message: `Bạn đã mượn cuốn sách này và đang ở trạng thái "${statusLabel}". Vui lòng trả sách trước khi mượn lại!` 
      });
    }
    const overdueBorrowing = await Borrowing.findOne({
      user: userId,
      book: bookId,
      status: { $in: ["borrowed", "renewed"] },
      dueDate: { $lt: new Date() }
    });

    if (overdueBorrowing) {
      return res.status(400).json({ 
        message: `Bạn đang mượn cuốn sách này và đã quá hạn trả. Vui lòng trả sách trước khi mượn lại!` 
      });
    }

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
    const populated = await Cart.findById(cart._id).populate({
      path: "items.bookId",
      select: "title images author",
      populate: { path: "author", select: "name" }
    });
    res.json(populated);
  } catch (error) {
    console.error("❌ Lỗi POST /cart/add:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

router.put("/update", verifyToken, async (req, res) => {
  try {
    const { bookId, quantity } = req.body;
    const userId = req.user?.id;
    if (!userId || !bookId) return res.status(400).json({ message: "Thiếu dữ liệu" });

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Không có giỏ hàng" });

    const item = cart.items.find(i => i.bookId && i.bookId.toString() === bookId);
    if (!item) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    if (quantity <= 0) cart.items = cart.items.filter(i => i.bookId.toString() !== bookId);
    else item.quantity = Number(quantity);

    await cart.save();
    const populated = await Cart.findById(cart._id).populate({
      path: "items.bookId",
      select: "title images author",
      populate: { path: "author", select: "name" }
    });
    res.json(populated);
  } catch (error) {
    console.error("❌ Lỗi PUT /cart/update:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

router.delete("/remove", verifyToken, async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user?.id;
    if (!userId || !bookId) return res.status(400).json({ message: "Thiếu dữ liệu" });

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Không có giỏ hàng" });

    cart.items = cart.items.filter(i => i.bookId && i.bookId.toString() !== bookId);
    await cart.save();

    const populated = await Cart.findById(cart._id).populate({
      path: "items.bookId",
      select: "title images author",
      populate: { path: "author", select: "name" }
    });
    res.json(populated);
  } catch (error) {
    console.error("❌ Lỗi DELETE /cart/remove:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

router.delete("/clear", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Chưa xác thực" });

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
