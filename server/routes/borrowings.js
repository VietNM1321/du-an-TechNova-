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
  PENDING_PICKUP: "pendingPickup", // sinh viên chưa lấy sách
  BORROWED: "borrowed",            // đã lấy sách
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
    // Cho phép gia hạn khi đang mượn hoặc đã được gia hạn trước đó
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

    // Kiểm tra xem user có sách nào bị mất chưa thanh toán không (chặn mượn tất cả sách)
    const unpaidLostBook = await Borrowing.findOne({
      user: req.user.id,
      status: "lost",
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

    // Kiểm tra xem user có sách nào đang mượn chưa trả không (chặn mượn tất cả sách)
    const activeBorrowing = await Borrowing.findOne({
      user: req.user.id,
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
        message: `Bạn đang có sách "${bookTitle}" ở trạng thái "${statusLabel}" chưa trả. Vui lòng trả sách trước khi mượn sách khác!`,
        errors: [`Bạn đang có sách "${bookTitle}" ở trạng thái "${statusLabel}" chưa trả. Vui lòng trả sách trước khi mượn sách khác!`]
      });
    }

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
          return { error: `Bạn đã mượn sách "${book.title}" và sách đã bị ${statusLabel}. Vui lòng hoàn tất thanh toán trước khi mượn lại!` };
        }

        // Kiểm tra các trạng thái khác (đang mượn, đã gia hạn, chưa lấy sách)
        const activeBorrowing = await Borrowing.findOne({
          user: req.user.id,
          book: item.bookId,
          status: { $in: ["borrowed", "renewed", "pendingPickup"] }
        });

        if (activeBorrowing) {
          const statusLabels = {
            borrowed: "đang mượn",
            renewed: "đã gia hạn (đang mượn)",
            pendingPickup: "chưa lấy sách"
          };
          const statusLabel = statusLabels[activeBorrowing.status] || activeBorrowing.status;
          return { error: `Bạn đã mượn sách "${book.title}" và đang ở trạng thái "${statusLabel}". Vui lòng trả sách trước khi mượn lại!` };
        }

        // Kiểm tra trạng thái quá hạn
        const overdueBorrowing = await Borrowing.findOne({
          user: req.user.id,
          book: item.bookId,
          status: { $in: ["borrowed", "renewed"] },
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

    // Kiểm tra và gộp đơn theo ngày mượn (tối đa 5 cuốn/đơn)
    const firstBorrowDate = items[0]?.borrowDate ? new Date(items[0].borrowDate) : new Date();
    // Chuẩn hóa ngày (chỉ lấy Y-M-D, không tính giờ)
    const normalizedDate = new Date(firstBorrowDate);
    normalizedDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(normalizedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Đếm tổng số lượng sách đã mượn trong ngày
    const existingBorrowingsSameDay = await Borrowing.find({
      user: req.user.id,
      borrowDate: {
        $gte: normalizedDate,
        $lte: endOfDay
      },
      status: { $in: ["pendingPickup", "borrowed", "renewed", "overdue"] }
    });

    const totalExistingQuantity = existingBorrowingsSameDay.reduce((sum, b) => sum + (b.quantity || 1), 0);
    const totalNewQuantity = bookChecks.reduce((sum, { borrowQty }) => sum + borrowQty, 0);
    const MAX_BOOKS_PER_ORDER = 5;

    if (totalExistingQuantity + totalNewQuantity > MAX_BOOKS_PER_ORDER) {
      const availableSlots = MAX_BOOKS_PER_ORDER - totalExistingQuantity;
      if (availableSlots <= 0) {
        return res.status(400).json({ 
          message: `Bạn đã mượn ${totalExistingQuantity} cuốn sách trong ngày ${normalizedDate.toLocaleDateString("vi-VN")}. Mỗi đơn mượn chỉ tối đa ${MAX_BOOKS_PER_ORDER} cuốn sách. Vui lòng chọn ngày khác hoặc trả sách cũ trước!`,
          errors: [`Bạn đã mượn ${totalExistingQuantity} cuốn sách trong ngày. Mỗi đơn mượn chỉ tối đa ${MAX_BOOKS_PER_ORDER} cuốn sách.`]
        });
      }

      // Chỉ cho phép mượn số lượng còn lại
      let remainingSlots = availableSlots;
      const allowedItems = [];
      const rejectedItems = [];

      for (const check of bookChecks) {
        if (remainingSlots >= check.borrowQty) {
          allowedItems.push(check);
          remainingSlots -= check.borrowQty;
        } else if (remainingSlots > 0) {
          // Cho phép mượn một phần
          allowedItems.push({ ...check, borrowQty: remainingSlots });
          rejectedItems.push({
            ...check,
            originalQty: check.borrowQty,
            allowedQty: remainingSlots
          });
          remainingSlots = 0;
        } else {
          rejectedItems.push(check);
        }
      }

      if (rejectedItems.length > 0) {
        const rejectionMessages = rejectedItems.map(({ book, borrowQty, originalQty, allowedQty }) => {
          if (allowedQty !== undefined && allowedQty > 0) {
            return `Sách "${book.title}": chỉ có thể mượn ${allowedQty}/${originalQty} cuốn (đã đạt giới hạn ${MAX_BOOKS_PER_ORDER} cuốn/đơn)`;
          }
          return `Sách "${book.title}": không thể mượn ${borrowQty} cuốn (đã đạt giới hạn ${MAX_BOOKS_PER_ORDER} cuốn/đơn trong ngày)`;
        });

        return res.status(400).json({
          message: `Bạn đã mượn ${totalExistingQuantity} cuốn sách trong ngày. Chỉ có thể mượn thêm ${availableSlots} cuốn nữa (tối đa ${MAX_BOOKS_PER_ORDER} cuốn/đơn).`,
          errors: rejectionMessages
        });
      }

      // Cập nhật bookChecks để chỉ tạo những sách được phép
      bookChecks.length = 0;
      bookChecks.push(...allowedItems);
    }

    const borrowings = await Promise.all(
      bookChecks.map(async ({ book, borrowQty, item }) => {
        const bookPopulated = await Book.findById(item.bookId).populate("author", "name").lean();
        const userSnapshot = user ? {
          fullName: user.fullName || "Khách vãng lai",
          studentId: user.studentCode || "",
          course: user.course || "",
          email: user.email || "",
        } : { fullName: "Khách vãng lai", studentId: "", course: "", email: "" };

        const bookSnapshot = {
          title: bookPopulated?.title || "Không rõ",
          author: typeof bookPopulated?.author === "string" ? bookPopulated.author : bookPopulated?.author?.name || "Không rõ",
          isbn: bookPopulated?.code || "N/A",
        };

        // Sử dụng ngày đã chuẩn hóa để đảm bảo tất cả cùng một đơn
        const borrowDateToUse = item.borrowDate ? new Date(item.borrowDate) : normalizedDate;
        borrowDateToUse.setHours(0, 0, 0, 0);

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

    // Tạo hoặc lấy mã đơn cho ngày mượn này (gộp đơn cùng ngày)
    const borrowingCode = await getOrCreateBorrowingCodeForDay(user?._id, normalizedDate);
    
    // Thêm borrowingCode vào tất cả các borrowings
    borrowings.forEach(b => {
      b.borrowingCode = borrowingCode;
    });

    // Thử insert với cơ chế retry khi gặp duplicate key trên borrowingCode
    let saved;
    let attempts = 0;
    const MAX_ATTEMPTS = 5;
    while (attempts < MAX_ATTEMPTS) {
      try {
        saved = await Borrowing.insertMany(borrowings);
        break;
      } catch (err) {
        // Mongo duplicate key error
        if (err?.code === 11000 && /borrowingCode/.test(err.message)) {
          attempts++;
          console.warn(`Duplicate borrowingCode detected, retrying (${attempts}/${MAX_ATTEMPTS})`);
          // Sinh mã mới đảm bảo tăng số thứ tự
          const newCode = await generateBorrowingCode(normalizedDate);
          borrowings.forEach(b => { b.borrowingCode = newCode; });
          // Nếu đạt giới hạn thử lại, ném lỗi để báo cho client
          if (attempts >= MAX_ATTEMPTS) throw err;
          // tiếp tục vòng lặp để thử insert lại
        } else {
          // lỗi khác -> ném tiếp
          throw err;
        }
      }
    }

    await Promise.all(
      bookChecks.map(async ({ book, borrowQty }) => {
        book.available -= borrowQty;
        if (book.available < 0) book.available = 0;
        await book.save();
      })
    );

    res.status(201).json({ 
      message: "✅ Tạo đơn mượn thành công!", 
      borrowings: saved,
      borrowingCode: borrowingCode 
    });
  } catch (error) {
    console.error("❌ Borrow error:", error);
    res.status(500).json({ message: "Lỗi server khi tạo đơn mượn!", error: error.message });
  }
});

// ──────────────── LẤY DANH SÁCH BORROWINGS ────────────────
router.get("/", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page-1)*limit;
    const { q, status, borrowFrom, borrowTo } = req.query;

    const filter = {};

    if (borrowFrom || borrowTo) filter.borrowDate = {};
    if (borrowFrom) filter.borrowDate.$gte = new Date(borrowFrom);
    if (borrowTo) filter.borrowDate.$lte = new Date(borrowTo);

    if (q?.trim()) {
      const text = q.trim();
      filter.$or = [
        { "userSnapshot.fullName": { $regex: text, $options: "i" } },
        { "userSnapshot.email": { $regex: text, $options: "i" } },
        { "bookSnapshot.title": { $regex: text, $options: "i" } },
      ];
    }

    const total = await Borrowing.countDocuments(filter);

    let borrowings = await Borrowing.find(filter)
      .sort({ borrowDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path:"book", populate:{ path:"author", select:"name" } })
      .populate("user");

    const now = new Date();
    borrowings = borrowings.map(b => {
      let statusB = b.status;
      if (statusB === STATUS_ENUM.BORROWED && new Date(b.dueDate) < now) statusB = STATUS_ENUM.OVERDUE;
      return {...b._doc, status: statusB};
    });

    if (status==="overdue") borrowings = borrowings.filter(b => b.status===STATUS_ENUM.OVERDUE);

    res.json({
      borrowings,
      currentPage: page,
      totalPages: Math.ceil(total/limit),
      totalItems: total,
    });
  } catch(error){
    console.error("❌ Lỗi lấy danh sách borrowings:", error);
    res.status(500).json({ message:"Lỗi server khi lấy danh sách mượn sách!" });
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
    res.status(500).json({ message:"Lỗi server khi lấy lịch sử mượn!" });
  }
});

// ──────────────── XÁC NHẬN LẤY SÁCH ────────────────
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



// ──────────────── BÁO HỎNG ────────────────
router.put("/:id/report-broken", verifyToken, upload.single("admin", "librarian"), async (req,res)=>{
  try{
    const { reason } = req.body;
    const image = req.file ? req.file.path : null;
    const borrowing = await Borrowing.findById(req.params.id).populate("book");
    if(!borrowing) return res.status(404).json({ message:"Không tìm thấy đơn mượn!" });

    borrowing.status = STATUS_ENUM.DAMAGED;
    borrowing.damageType = "broken";
    borrowing.damageReason = reason || "Không ghi rõ";
    // Nếu có ảnh mới thì cập nhật, nếu không giữ ảnh cũ
    if(image) borrowing.damageImage = image;
    borrowing.imgStudent = borrowing.imgStudent || null; // giữ nếu đã có
    borrowing.imgCard = borrowing.imgCard || null;
    borrowing.compensationAmount = borrowing.book?.Pricebook ?? borrowing.compensationAmount ?? 50000;
    borrowing.paymentStatus = "pending";
    await borrowing.save();

    res.json({ 
      message:`✅ Đã báo hỏng! Vui lòng thanh toán ${borrowing.compensationAmount.toLocaleString("vi-VN")} VNĐ.`,
      borrowing 
    });
  } catch(error){
    console.error("❌ Lỗi báo hỏng:", error);
    res.status(500).json({ message:"Lỗi server khi báo hỏng!" });
  }
});

// ──────────────── BÁO MẤT ────────────────
router.put("/:id/report-lost", verifyToken, upload.single("admin", "librarian"), async (req,res)=>{
  try{
    const image = req.file ? req.file.path : null;
    const borrowing = await Borrowing.findById(req.params.id).populate("book");
    if(!borrowing) return res.status(404).json({ message:"Không tìm thấy đơn mượn!" });

    borrowing.status = STATUS_ENUM.LOST;
    borrowing.damageType = "lost";
    borrowing.damageImage = image || borrowing.damageImage || null; // giữ ảnh cũ nếu có
    borrowing.compensationAmount = borrowing.book?.Pricebook ?? borrowing.compensationAmount ?? 50000;
    borrowing.paymentStatus = "pending";
    await borrowing.save();

    res.json({ 
      message:`✅ Đã báo mất! Vui lòng thanh toán ${borrowing.compensationAmount.toLocaleString("vi-VN")} VNĐ.`,
      borrowing 
    });
  } catch(error){
    console.error("❌ Lỗi báo mất:", error);
    res.status(500).json({ message:"Lỗi server khi báo mất!" });
  }
});


// ──────────────── CẬP NHẬT TIỀN ĐỀN ────────────────
router.put("/:id/compensation", verifyToken, requireRole("admin", "librarian"), async (req,res)=>{
  try{
    const { compensationAmount } = req.body;
    const borrowing = await Borrowing.findByIdAndUpdate(
      req.params.id, 
      { compensationAmount, status: STATUS_ENUM.COMPENSATED }, 
      { new: true }
    );
    if(!borrowing) return res.status(404).json({ message:"Không tìm thấy đơn mượn!" });
    res.json({ message:"💰 Đã cập nhật tiền đền!", borrowing });
  } catch(error){
    console.error("❌ Lỗi cập nhật tiền đền:", error);
    res.status(500).json({ message:"Lỗi server khi nhập tiền đền!" });
  }
});

// ──────────────── THANH TOÁN ────────────────
router.put("/:id/pay", verifyToken, upload.single("qrCodeImage"), async (req,res)=>{
  try{
    const { paymentMethod, paymentNote } = req.body;
    const qrCodeImage = req.file ? req.file.path : null;

    if(!paymentMethod || !["cash","bank"].includes(paymentMethod)) return res.status(400).json({ message:"Phương thức thanh toán không hợp lệ!" });

    const borrowing = await Borrowing.findById(req.params.id);
    if(!borrowing) return res.status(404).json({ message:"Không tìm thấy đơn mượn!" });

    if(req.user.role!=="admin" && borrowing.user.toString()!==req.user.id) 
      return res.status(403).json({ message:"Bạn không có quyền thanh toán đơn này!" });

    if(!["damaged","lost"].includes(borrowing.status)) 
      return res.status(400).json({ message:"Chỉ thanh toán khi sách bị hỏng hoặc mất!" });

    // Nếu thanh toán qua ngân hàng: cho phép KHÔNG bắt buộc upload QR mỗi lần
    // Nếu có ảnh mới thì lưu, còn không sẽ giữ nguyên (nếu trước đó đã có)

    // Khi người dùng thanh toán (tiền mặt hoặc ngân hàng), luôn chuyển sang trạng thái
    // "chờ xác nhận thanh toán". Admin sẽ xác nhận ở endpoint /confirm-payment.
    const updateData = {
      paymentMethod,
      paymentStatus: "pending",
      paymentDate: null,
      paymentNote: paymentNote || "",
      status: borrowing.status,
    };
    if(qrCodeImage) updateData.qrCodeImage = qrCodeImage;
    if(paymentMethod==="bank" && borrowing.qrCodeImage && !qrCodeImage) updateData.qrCodeImage = borrowing.qrCodeImage;

    const updated = await Borrowing.findByIdAndUpdate(req.params.id, updateData, { new:true });
    res.json({ 
      message: "✅ Đã ghi nhận thanh toán, vui lòng chờ quản trị viên xác nhận!", 
      borrowing: updated 
    });
  } catch(error){
    console.error("❌ Lỗi thanh toán:", error);
    res.status(500).json({ message:"Lỗi server khi xử lý thanh toán!" });
  }
});

// ──────────────── XÁC NHẬN THANH TOÁN ────────────────
router.put("/:id/confirm-payment", verifyToken, requireRole("admin", "librarian"), async (req,res)=>{
  try{
    const borrowing = await Borrowing.findByIdAndUpdate(
      req.params.id, 
      { paymentStatus:"completed", paymentDate:new Date(), status:STATUS_ENUM.COMPENSATED }, 
      { new:true }
    );
    if(!borrowing) return res.status(404).json({ message:"Không tìm thấy đơn mượn!" });
    res.json({ message:"✅ Đã xác nhận thanh toán thành công!", borrowing });
  } catch(error){
    console.error("❌ Lỗi xác nhận thanh toán:", error);
    res.status(500).json({ message:"Lỗi server khi xác nhận thanh toán!" });
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

// ──────────────── TRẢ SÁCH ────────────────
router.put("/:id/return", verifyToken, requireRole("admin", "librarian"), async (req,res)=>{
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

export default router;
