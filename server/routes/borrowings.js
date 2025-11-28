import express from "express";
import mongoose from "mongoose";
import Borrowing from "../models/borrowings.js";
import Book from "../models/books.js";
import User from "../models/User.js";
import multer from "multer";
import { verifyToken, isSelfOrAdmin, requireRole } from "../middleware/auth.js";
import { getOrCreateBorrowingCodeForDay, generateBorrowingCode } from "../utils/generateBorrowingCode.js";

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const upload = multer({ storage });

// Trạng thái
const STATUS_ENUM = {
  PENDING_PICKUP: "pendingPickup",
  BORROWED: "borrowed",
  RENEWED: "renewed",
  RETURNED: "returned",
  DAMAGED: "damaged",
  LOST: "lost",
  OVERDUE: "overdue",
  COMPENSATED: "compensated",
};

// ──────────────── GIA HẠN SÁCH ────────────────
router.put('/:id/renew', verifyToken, async (req, res) => {
  try {
    const borrowing = await Borrowing.findById(req.params.id);
    if (!borrowing) return res.status(404).json({ message: 'Không tìm thấy đơn mượn!' });
    if (![STATUS_ENUM.BORROWED, STATUS_ENUM.RENEWED].includes(borrowing.status)) {
      return res.status(400).json({ message: 'Chỉ có thể gia hạn khi đang mượn!' });
    }
    if ((borrowing.renewCount || 0) >= 3) {
      return res.status(400).json({ message: 'Đã hết lượt gia hạn, vui lòng trả sách!' });
    }

    const baseDue = borrowing.dueDate ? new Date(borrowing.dueDate) : new Date();
    borrowing.dueDate = new Date(baseDue.getTime() + 7 * 24 * 60 * 60 * 1000);
    borrowing.renewCount = (borrowing.renewCount || 0) + 1;
    borrowing.status = STATUS_ENUM.RENEWED;
    await borrowing.save();

    res.json({ message: 'Gia hạn thành công!', borrowing });
  } catch (err) {
    console.error('Lỗi gia hạn:', err);
    res.status(500).json({ message: 'Lỗi server khi gia hạn!' });
  }
});

// ──────────────── KIỂM TRA QUYỀN REVIEW SÁCH ────────────────
router.get("/can-review/:bookId", verifyToken, async (req, res) => {
  try {
    const { bookId } = req.params;
    if (!bookId?.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).json({ message: "ID sách không hợp lệ" });

    const hasReturned = await Borrowing.exists({
      user: req.user.id,
      book: bookId,
      status: STATUS_ENUM.RETURNED,
      returnDate: { $ne: null },
    });

    res.json({ canReview: !!hasReturned });
  } catch (error) {
    console.error("❌ Lỗi kiểm tra quyền đánh giá:", error);
    res.status(500).json({ message: "Lỗi server khi kiểm tra quyền đánh giá" });
  }
});

// ──────────────── TẠO ĐƠN MƯỢN ────────────────
router.post("/", verifyToken, async (req, res) => {
  try {
    const { items } = req.body;
    if (!items?.length) return res.status(400).json({ message: "Danh sách sách mượn trống!" });

    const user = await User.findById(req.user.id).lean();

    // Kiểm tra sách bị mất chưa thanh toán
    const unpaidLostBook = await Borrowing.findOne({
      user: req.user.id,
      status: STATUS_ENUM.LOST,
      $or: [
        { paymentStatus: { $ne: "completed" } },
        { paymentStatus: { $exists: false } }
      ]
    }).populate("book", "title");

    if (unpaidLostBook) {
      const bookTitle = unpaidLostBook.book?.title || unpaidLostBook.bookSnapshot?.title || "một cuốn sách";
      return res.status(400).json({ 
        message: `Bạn có sách "${bookTitle}" bị mất chưa thanh toán. Vui lòng hoàn tất thanh toán trước khi mượn sách khác!`,
        errors: [`Bạn có sách "${bookTitle}" bị mất chưa thanh toán. Vui lòng hoàn tất thanh toán trước khi mượn sách khác!`]
      });
    }

    // Kiểm tra sách đang mượn chưa trả
    const activeBorrowing = await Borrowing.findOne({
      user: req.user.id,
      status: { $in: [STATUS_ENUM.BORROWED, STATUS_ENUM.RENEWED, STATUS_ENUM.PENDING_PICKUP, STATUS_ENUM.OVERDUE] }
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
        message: `Bạn đang có sách "${bookTitle}" ở trạng thái "${statusLabel}" chưa trả. Vui lòng trả sách trước khi mượn sách khác!`,
        errors: [`Bạn đang có sách "${bookTitle}" ở trạng thái "${statusLabel}" chưa trả. Vui lòng trả sách trước khi mượn sách khác!`]
      });
    }

    // Kiểm tra sách tồn kho và trạng thái
    const bookChecks = await Promise.all(
      items.map(async (item) => {
        const book = await Book.findById(item.bookId);
        if (!book) return { error: `Không tìm thấy sách với ID: ${item.bookId}` };
        const borrowQty = item.quantity || 1;
        if (book.available < borrowQty) return { error: `Không đủ sách "${book.title}" để mượn. Hiện còn ${book.available}, yêu cầu ${borrowQty}` };
        
        // Kiểm tra sách mất/hỏng chưa thanh toán
        const lostOrDamagedBorrowing = await Borrowing.findOne({
          user: req.user.id,
          book: item.bookId,
          status: { $in: [STATUS_ENUM.LOST, STATUS_ENUM.DAMAGED] },
          $or: [
            { paymentStatus: { $ne: "completed" } },
            { paymentStatus: { $exists: false } }
          ]
        });

        if (lostOrDamagedBorrowing) {
          const statusLabels = { lost: "mất", damaged: "hỏng" };
          const statusLabel = statusLabels[lostOrDamagedBorrowing.status] || lostOrDamagedBorrowing.status;
          return { error: `Bạn đã mượn sách "${book.title}" và sách đã bị ${statusLabel}. Vui lòng hoàn tất thanh toán trước khi mượn lại!` };
        }

        // Kiểm tra trạng thái đang mượn hoặc gia hạn
        const activeBorrowing = await Borrowing.findOne({
          user: req.user.id,
          book: item.bookId,
          status: { $in: [STATUS_ENUM.BORROWED, STATUS_ENUM.RENEWED, STATUS_ENUM.PENDING_PICKUP] }
        });
        if (activeBorrowing) {
          const statusLabels = { borrowed: "đang mượn", renewed: "đã gia hạn (đang mượn)", pendingPickup: "chưa lấy sách" };
          const statusLabel = statusLabels[activeBorrowing.status] || activeBorrowing.status;
          return { error: `Bạn đã mượn sách "${book.title}" và đang ở trạng thái "${statusLabel}". Vui lòng trả sách trước khi mượn lại!` };
        }

        // Kiểm tra quá hạn
        const overdueBorrowing = await Borrowing.findOne({
          user: req.user.id,
          book: item.bookId,
          status: { $in: [STATUS_ENUM.BORROWED, STATUS_ENUM.RENEWED] },
          dueDate: { $lt: new Date() }
        });
        if (overdueBorrowing) {
          return { error: `Bạn đang mượn sách "${book.title}" và đã quá hạn trả. Vui lòng trả sách trước khi mượn lại!` };
        }

        return { book, borrowQty, item };
      })
    );

    const errors = bookChecks.filter(c => c.error);
    if (errors.length) {
      const errorMessages = errors.map(e => e.error);
      return res.status(400).json({ 
        message: errorMessages.length === 1 ? errorMessages[0] : "Có lỗi xảy ra khi tạo đơn mượn!", 
        errors: errorMessages 
      });
    }

    // Chuẩn hóa ngày mượn
    const firstBorrowDate = items[0]?.borrowDate ? new Date(items[0].borrowDate) : new Date();
    const normalizedDate = new Date(firstBorrowDate);
    normalizedDate.setHours(0, 0, 0, 0);

    // Kiểm tra giới hạn 5 sách/ngày
    const existingBorrowingsSameDay = await Borrowing.find({
      user: req.user.id,
      borrowDate: { $gte: normalizedDate, $lte: new Date(normalizedDate.getTime() + 86399999) },
      status: { $in: [STATUS_ENUM.PENDING_PICKUP, STATUS_ENUM.BORROWED, STATUS_ENUM.RENEWED, STATUS_ENUM.OVERDUE] }
    });
    const totalExistingQuantity = existingBorrowingsSameDay.reduce((sum, b) => sum + (b.quantity || 1), 0);
    const totalNewQuantity = bookChecks.reduce((sum, { borrowQty }) => sum + borrowQty, 0);
    const MAX_BOOKS_PER_ORDER = 5;

    if (totalExistingQuantity + totalNewQuantity > MAX_BOOKS_PER_ORDER) {
      return res.status(400).json({ 
        message: `Bạn đã mượn ${totalExistingQuantity} cuốn sách trong ngày. Mỗi đơn mượn chỉ tối đa ${MAX_BOOKS_PER_ORDER} cuốn sách.`, 
        errors: []
      });
    }

    const borrowings = await Promise.all(
      bookChecks.map(async ({ book, borrowQty, item }) => {
        const bookPopulated = await Book.findById(item.bookId).populate("author", "name").lean();
        const userSnapshot = {
          fullName: user?.fullName || "Khách vãng lai",
          studentId: user?.studentCode || "",
          course: user?.course || "",
          email: user?.email || "",
        };
        const bookSnapshot = {
          title: bookPopulated?.title || "Không rõ",
          author: typeof bookPopulated?.author === "string" ? bookPopulated.author : bookPopulated?.author?.name || "Không rõ",
          isbn: bookPopulated?.code || "N/A",
        };
        const borrowDateToUse = item.borrowDate ? new Date(item.borrowDate) : normalizedDate;
        borrowDateToUse.setHours(0,0,0,0);

        return {
          user: user?._id,
          book: book?._id,
          borrowDate: borrowDateToUse,
          dueDate: item.dueDate || new Date(Date.now() + 7*24*60*60*1000),
          quantity: borrowQty,
          status: STATUS_ENUM.PENDING_PICKUP,
          isPickedUp: false,
          userSnapshot,
          bookSnapshot,
          compensationAmount: bookPopulated?.Pricebook ?? 50000,
        };
      })
    );

    const borrowingCode = await getOrCreateBorrowingCodeForDay(user?._id, normalizedDate);
    borrowings.forEach(b => { b.borrowingCode = borrowingCode; });

    let saved;
    let attempts = 0;
    const MAX_ATTEMPTS = 5;
    while (attempts < MAX_ATTEMPTS) {
      try {
        saved = await Borrowing.insertMany(borrowings);
        break;
      } catch (err) {
        if (err?.code === 11000 && /borrowingCode/.test(err.message)) {
          attempts++;
          const newCode = await generateBorrowingCode(normalizedDate);
          borrowings.forEach(b => { b.borrowingCode = newCode; });
          if (attempts >= MAX_ATTEMPTS) throw err;
        } else throw err;
      }
    }

    await Promise.all(
      bookChecks.map(async ({ book, borrowQty }) => {
        book.available -= borrowQty;
        if (book.available < 0) book.available = 0;
        await book.save();
      })
    );

    res.status(201).json({ message: "✅ Tạo đơn mượn thành công!", borrowings: saved, borrowingCode });
  } catch (error) {
    console.error("❌ Borrow error:", error);
    res.status(500).json({ message: "Lỗi server khi tạo đơn mượn!", error: error.message });
  }
});

// ──────────────── XÁC NHẬN LẤY SÁCH + UPLOAD 2 ẢNH ────────────────
router.put(
  "/:id/pickup",
  verifyToken,
  requireRole("admin", "librarian"),
  upload.fields([
    { name: "imgStudent", maxCount: 1 },
    { name: "imgCard", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const borrowing = await Borrowing.findById(req.params.id);
      if (!borrowing)
        return res.status(404).json({ message: "Không tìm thấy đơn mượn!" });

      if (borrowing.isPickedUp)
        return res.status(400).json({ message: "Đã xác nhận lấy sách trước đó!" });

      const pickupImage = req.files?.imgStudent?.[0]?.path;
      const cardImage = req.files?.imgCard?.[0]?.path;

      if (!pickupImage || !cardImage)
        return res.status(400).json({ message: "Thiếu ảnh sinh viên hoặc thẻ!" });

      borrowing.imgStudent = pickupImage;
      borrowing.imgCard = cardImage;
      borrowing.isPickedUp = true;
      borrowing.status = STATUS_ENUM.BORROWED;

      await borrowing.save();
      res.json({ message: "✅ Đã xác nhận lấy sách!", imgStudent: pickupImage, imgCard: cardImage });
    } catch (error) {
      console.error("❌ Lỗi xác nhận lấy sách:", error);
      res.status(500).json({ message: "Lỗi server khi xác nhận lấy sách!" });
    }
  }
);

// ──────────────── BÁO HỎNG / BÁO MẤT ────────────────
router.put("/:id/report", verifyToken, requireRole("admin", "librarian"), async (req, res) => {
  try {
    const { status } = req.body; // damaged hoặc lost
    if (![STATUS_ENUM.DAMAGED, STATUS_ENUM.LOST].includes(status)) return res.status(400).json({ message: "Trạng thái không hợp lệ!" });

    const borrowing = await Borrowing.findById(req.params.id);
    if (!borrowing) return res.status(404).json({ message: "Không tìm thấy đơn mượn!" });

    borrowing.status = status;
    borrowing.isPickedUp = true;
    borrowing.paymentStatus = "pending";
    await borrowing.save();

    res.json({ message: `Đã báo ${status === STATUS_ENUM.LOST ? "mất" : "hỏng"} sách!`, borrowing });
  } catch (err) {
    console.error("❌ Lỗi báo hỏng/mất:", err);
    res.status(500).json({ message: "Lỗi server khi báo hỏng/mất!" });
  }
});

// ──────────────── THANH TOÁN BỒI THƯỜNG ────────────────
router.put("/:id/compensate", verifyToken, async (req,res)=>{
  try{
    const borrowing = await Borrowing.findById(req.params.id);
    if(!borrowing) return res.status(404).json({message:"Không tìm thấy đơn mượn!"});
    if(!["lost","damaged"].includes(borrowing.status)) return res.status(400).json({message:"Chỉ thanh toán cho sách mất/hỏng"});
    borrowing.paymentStatus = "completed";
    borrowing.status = STATUS_ENUM.COMPENSATED;
    await borrowing.save();
    res.json({message:"Thanh toán bồi thường thành công!", borrowing});
  }catch(err){
    console.error(err);
    res.status(500).json({message:"Lỗi server khi thanh toán bồi thường"});
  }
});

// ──────────────── LỊCH SỬ MƯỢN ────────────────
router.get("/history/:userId", verifyToken, isSelfOrAdmin("userId"), async (req,res)=>{
  try{
    const { userId } = req.params;
    const filter = /^[0-9a-fA-F]{24}$/.test(userId) ? { user: userId } : {};
    let borrowings = await Borrowing.find(filter)
      .sort({ borrowDate:-1 })
      .populate({ path:"book", populate:{ path:"author", select:"name" } })
      .populate("user");

    const now = new Date();
    borrowings = borrowings.map(b=>{
      let status = b.status;
      if(status===STATUS_ENUM.BORROWED && new Date(b.dueDate)<now) status = STATUS_ENUM.OVERDUE;
      return {...b._doc, status};
    });
    res.json(borrowings);
  } catch(error){
    console.error("❌ Lỗi lấy lịch sử:", error);
    res.status(500).json({message:"Lỗi server khi lấy lịch sử mượn"});
  }
});

// ──────────────── DANH SÁCH MƯỢN ────────────────
router.get("/", verifyToken, requireRole("admin","librarian"), async (req,res)=>{
  try{
    const { page=1, limit=20, search } = req.query;
    const query = {};
    if(search){
      query.$or = [
        { borrowingCode: new RegExp(search,"i") },
        { status: new RegExp(search,"i") }
      ];
    }
    const borrowings = await Borrowing.find(query)
      .sort({ borrowDate:-1 })
      .skip((page-1)*limit)
      .limit(parseInt(limit))
      .populate({ path:"book", populate:{ path:"author", select:"name" } })
      .populate("user");
    const total = await Borrowing.countDocuments(query);
    res.json({ borrowings, total, page: parseInt(page), limit: parseInt(limit) });
  }catch(err){
    console.error(err);
    res.status(500).json({message:"Lỗi server khi lấy danh sách mượn"});
  }
});
// ──────────────── TRẢ SÁCH ────────────────
router.put("/:id/return", verifyToken, requireRole("admin"), async (req,res)=>{
  try{
    const borrowing = await Borrowing.findById(req.params.id);
    if(!borrowing) return res.status(404).json({ message:"Không tìm thấy đơn mượn!" });
    if(borrowing.status===STATUS_ENUM.RETURNED) return res.status(400).json({ message:"Đơn mượn đã trả!" });

    const returnQty = borrowing.quantity || 1;
    borrowing.status = STATUS_ENUM.RETURNED;
    borrowing.returnDate = new Date();
    await borrowing.save();

    if(borrowing.book){
      const book = await Book.findById(borrowing.book);
      if(book){
        book.available += returnQty;
        if(book.available > book.quantity) book.available = book.quantity;
        await book.save();
      }
    }

    res.json({ message:"✅ Xác nhận trả thành công!", borrowing });
  } catch(error){
    console.error("❌ Lỗi xác nhận trả:", error);
    res.status(500).json({ message:"Lỗi server khi xác nhận trả sách!" });
  }
});
// ──────────────── THỐNG KÊ QUỸ THƯ VIỆN (TIỀN ĐỀN BÙ) ────────────────
router.get("/fund/summary", verifyToken, requireRole("admin", "librarian"), async (req, res) => {
  try {
    const [stats] = await Borrowing.aggregate([
      {
        $match: {
          paymentStatus: "completed",
          compensationAmount: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          totalFund: { $sum: "$compensationAmount" },
          totalRecords: { $sum: 1 },
        },
      },
    ]);

    const recent = await Borrowing.find({
      paymentStatus: "completed",
      compensationAmount: { $gt: 0 },
    })
      .sort({ paymentDate: -1 })
      .limit(20)
      .select("bookSnapshot userSnapshot compensationAmount paymentDate status");

    res.json({
      totalFund: stats?.totalFund || 0,
      totalRecords: stats?.totalRecords || 0,
      recent,
    });
  } catch (error) {
    console.error("❌ Lỗi lấy quỹ thư viện:", error);
    res.status(500).json({ message: "Lỗi server khi lấy quỹ thư viện!" });
  }
});
export default router;
