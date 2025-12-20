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

    // Kiểm tra sách lost, damaged, overdue chưa thanh toán
    const unpaidBorrowing = await Borrowing.findOne({
      user: userId,
      status: { $in: ["lost", "damaged", "overdue"] },
      $or: [
        { paymentStatus: { $ne: "completed" } },
        { paymentStatus: { $exists: false } }
      ]
    }).populate("book", "title");

    if (unpaidBorrowing) {
      const bookTitle = unpaidBorrowing.book?.title || unpaidBorrowing.bookSnapshot?.title || "một cuốn sách";
      const statusLabels = {
        lost: "mất",
        damaged: "hỏng",
        overdue: "quá hạn"
      };
      const statusLabel = statusLabels[unpaidBorrowing.status] || unpaidBorrowing.status;
      return res.status(400).json({ 
        message: `Bạn có sách "${bookTitle}" ở trạng thái "${statusLabel}" chưa thanh toán. Vui lòng hoàn tất thanh toán trước khi mượn sách khác!` 
      });
    }

    // Đếm số sách đang mượn (borrowed + renewed)
    const activeBorrowingsCount = await Borrowing.countDocuments({
      user: userId,
      status: { $in: ["borrowed", "renewed"] }
    });

    // Lấy giỏ hàng hiện tại
    let currentCart = await Cart.findOne({ userId }) || new Cart({ userId, items: [] });

    // Tổng số sách trong đơn mượn mới = sách đang mượn + sách trong giỏ + sách mới này
    const totalBooksInOrder = activeBorrowingsCount + currentCart.items.length + 1;

    if (totalBooksInOrder > 5) {
      return res.status(400).json({ 
        message: `Bạn chỉ được mượn tối đa 5 cuốn sách trong một đơn. Hiện tại bạn đã có ${activeBorrowingsCount} sách đang mượn và ${currentCart.items.length} sách trong giỏ.` 
      });
    }

    // Kiểm tra nếu sách này đang được mượn bởi user này
    const activeBorrowingUserBook = await Borrowing.findOne({
      user: userId,
      book: bookId,
      status: { $in: ["borrowed", "renewed", "pendingPickup"] }
    });

    if (activeBorrowingUserBook) {
      const statusLabels = {
        borrowed: "đang mượn",
        renewed: "đã gia hạn (đang mượn)",
        pendingPickup: "chưa lấy sách"
      };
      const statusLabel = statusLabels[activeBorrowingUserBook.status] || activeBorrowingUserBook.status;
      return res.status(400).json({ 
        message: `Bạn đã mượn cuốn sách này và đang ở trạng thái "${statusLabel}". Vui lòng trả sách trước khi mượn lại!` 
      });
    }

    // Kiểm tra nếu sách này overdue
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

    const existingItem = currentCart.items.find(i => i.bookId.toString() === bookId);

    if (existingItem) {
      existingItem.quantity += Number(quantity);
      existingItem.fullName = fullName;
      existingItem.studentId = studentId;
      existingItem.email = email;
      existingItem.borrowDate = borrowDate;
      existingItem.returnDate = returnDate;
    } else {
      currentCart.items.push({
        bookId,
        quantity: Number(quantity),
        fullName,
        studentId,
        email,
        borrowDate,
        returnDate,
      });
    }

    await currentCart.save();
    const populated = await Cart.findById(currentCart._id).populate({
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
