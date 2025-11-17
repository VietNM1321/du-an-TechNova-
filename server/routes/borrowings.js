import express from "express";
import Borrowing from "../models/borrowings.js";
import Book from "../models/books.js";
import User from "../models/User.js";
import multer from "multer";
import { verifyToken, isSelfOrAdmin, requireRole } from "../middleware/auth.js";

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const upload = multer({ storage });

const STATUS_ENUM = {
  BORROWED: "borrowed",
  RENEWED: "renewed",
  PENDING_PICKUP: "pendingPickup", // sinh viên chưa lấy sách
  BORROWED: "borrowed",            // đã lấy sách
  RETURNED: "returned",
  DAMAGED: "damaged",
  LOST: "lost",
  OVERDUE: "overdue",
  COMPENSATED: "compensated",
};
// Gia hạn sách: chỉ khi đang mượn, tối đa 3 lần
router.put('/:id/renew', verifyToken, async (req, res) => {
  try {
    const borrowing = await Borrowing.findById(req.params.id);
    if (!borrowing) return res.status(404).json({ message: 'Không tìm thấy đơn mượn!' });
    if (borrowing.status !== STATUS_ENUM.BORROWED) {
      return res.status(400).json({ message: 'Chỉ có thể gia hạn khi đang mượn!' });
    }
    if ((borrowing.renewCount || 0) >= 3) {
      return res.status(400).json({ message: 'Đã hết lượt gia hạn, vui lòng trả sách!' });
    }
    // Gia hạn thêm 1 tuần
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

// Kiểm tra quyền review sách
router.get("/can-review/:bookId", verifyToken, async (req, res) => {
  try {
    const { bookId } = req.params;
    if (!bookId || !bookId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "ID sách không hợp lệ" });
    }
    const hasReturned = await Borrowing.exists({
      user: req.user.id,
      book: bookId,
      status: STATUS_ENUM.RETURNED,
      returnDate: { $ne: null },
    });
    return res.json({ canReview: !!hasReturned });
  } catch (error) {
    console.error("❌ Lỗi kiểm tra quyền đánh giá:", error);
    res.status(500).json({ message: "Lỗi server khi kiểm tra quyền đánh giá" });
  }
});

// Tạo đơn mượn
router.post("/", verifyToken, async (req, res) => {
  try {
    const { items } = req.body;
    if (!items?.length) return res.status(400).json({ message: "Danh sách sách mượn trống!" });

    const user = await User.findById(req.user.id).lean();

    // Kiểm tra số lượng available cho tất cả sách trước khi tạo đơn
    const bookChecks = await Promise.all(
      items.map(async (item) => {
        const book = await Book.findById(item.bookId);
        if (!book) return { error: `Không tìm thấy sách với ID: ${item.bookId}` };
        const borrowQty = item.quantity || 1;
        if (book.available < borrowQty) {
          return { 
            error: `Không đủ sách "${book.title}" để mượn. Hiện chỉ còn ${book.available} quyển, bạn yêu cầu ${borrowQty} quyển.`,
            bookId: item.bookId
          };
        }
        return { book, borrowQty, item };
      })
    );

    const errors = bookChecks.filter(check => check.error);
    if (errors.length > 0) {
      return res.status(400).json({ 
        message: "Không đủ số lượng sách để mượn!",
        errors: errors.map(e => e.error)
      });
    }

    // Tạo các đơn mượn và cập nhật số lượng
    const borrowings = await Promise.all(
      bookChecks.map(async ({ book, borrowQty, item }) => {
        const bookPopulated = await Book.findById(item.bookId).populate("author", "name").lean();
        const userSnapshot = user ? {
          fullName: user.fullName || "Khách vãng lai",
          studentId: user.studentCode || "",
          course: user.course || "",
          email: user.email || "",
        } : { fullName: "Khách vãng lai", studentId: "", course: "", email: "" };
        const bookSnapshot = bookPopulated ? {
          title: bookPopulated.title || "Không rõ",
          author:
            (typeof bookPopulated.author === "string" ? bookPopulated.author : bookPopulated.author?.name) ||
            "Không rõ",
          isbn: bookPopulated.code || "N/A",
        } : { title: "Không rõ", author: "Không rõ", isbn: "N/A" };

        return {
          user: user?._id,
          book: book?._id,
          borrowDate: item.borrowDate || new Date(),
          dueDate: item.dueDate || new Date(Date.now() + 7*24*60*60*1000),
          quantity: borrowQty,
          status: STATUS_ENUM.PENDING_PICKUP, // mới thêm
          isPickedUp: false,                 // chưa lấy sách
          userSnapshot,
          bookSnapshot,
          compensationAmount: bookPopulated?.Pricebook ?? 50000,
        };
      })
    );

    const saved = await Borrowing.insertMany(borrowings);

    // Cập nhật số lượng available cho từng sách
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
    });
  } catch (error) {
    console.error("❌ Borrow error:", error);
    res.status(500).json({ message: "Lỗi server khi tạo đơn mượn!", error: error.message });
  }
});

// Lấy danh sách borrowings
router.get("/", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page-1)*limit;
    const {q,status,user,book,borrowFrom,borrowTo,dueFrom,dueTo,sort,order} = req.query;

    const filter = {};
    if (user) filter.user = user;
    if (book) filter.book = book;
    if (status && ["borrowed", "renewed", "returned", "damaged", "lost", "compensated", "overdue"].includes(status)) {
      if (status !== "overdue") {
        filter.status = status;
      }
    if (status && ["pendingPickup","borrowed", "returned", "damaged", "lost", "compensated", "overdue"].includes(status)) {
      if (status !== "overdue") filter.status = status;
    }
    if (borrowFrom || borrowTo) {
      filter.borrowDate = {};
      if (borrowFrom) filter.borrowDate.$gte = new Date(borrowFrom);
      if (borrowTo) filter.borrowDate.$lte = new Date(borrowTo);
    }
    if (dueFrom || dueTo) {
      filter.dueDate = {};
      if (dueFrom) filter.dueDate.$gte = new Date(dueFrom);
      if (dueTo) filter.dueDate.$lte = new Date(dueTo);
    }
    if (q && q.trim()) {
      const text = q.trim();
      filter.$or = [
        { "userSnapshot.fullName": { $regex: text, $options: "i" } },
        { "userSnapshot.email": { $regex: text, $options: "i" } },
        { "userSnapshot.studentId": { $regex: text, $options: "i" } },
        { "bookSnapshot.title": { $regex: text, $options: "i" } },
        { "bookSnapshot.isbn": { $regex: text, $options: "i" } },
      ];
    }

    const total = await Borrowing.countDocuments(filter);
    const sortSpec = sort ? { [sort]: (order||"desc").toLowerCase()==="asc"?1:-1 } : { borrowDate: -1 };
    let borrowings = await Borrowing.find(filter)
      .sort(sortSpec)
      .skip(skip)
      .limit(limit)
      .populate({ path:"book", populate:{ path:"author", select:"name" } })
      .populate("user");

    const now = new Date();
    let updated = borrowings.map(b => {
      let status = b.status;
      if (status === STATUS_ENUM.BORROWED && new Date(b.dueDate)<now) status = STATUS_ENUM.OVERDUE;
      return {...b._doc, status};
    });
    if (status==="overdue") updated = updated.filter(b => b.status===STATUS_ENUM.OVERDUE);

    res.json({
      borrowings: updated,
      currentPage: page,
      totalPages: Math.ceil(total/limit),
      totalItems: total,
    });
  } catch(err){
    console.error("❌ Lỗi lấy danh sách borrowings:", err);
    res.status(500).json({ message:"Lỗi server khi lấy danh sách mượn sách!" });
  }
});

// Lịch sử mượn
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

// Xác nhận lấy sách
router.put("/:id/pickup", verifyToken, requireRole("admin"), async (req,res)=>{
  try{
    const borrowing = await Borrowing.findById(req.params.id);
    if(!borrowing) return res.status(404).json({ message:"Không tìm thấy đơn mượn!" });
    if(borrowing.isPickedUp) return res.status(400).json({ message:"Đã xác nhận lấy sách trước đó!" });

    borrowing.isPickedUp = true;
    borrowing.status = STATUS_ENUM.BORROWED;
    await borrowing.save();
    res.json({ message:"📘 Đã xác nhận sinh viên đã lấy sách!", borrowing });
  } catch(error){
    console.error("❌ Lỗi xác nhận lấy sách:", error);
    res.status(500).json({ message:"Lỗi server khi xác nhận lấy sách!" });
  }
});

// Các route báo hỏng, báo mất, nhập tiền đền, thanh toán, confirm-payment, trả sách
// --- giữ nguyên logic như bạn đã viết ---
router.put("/:id/report-broken", verifyToken, upload.single("image"), async (req,res)=>{
  try{
    const { reason } = req.body;
    const image = req.file ? req.file.path : null;
    const borrowing = await Borrowing.findById(req.params.id).populate("book");
    if(!borrowing) return res.status(404).json({ message:"Không tìm thấy đơn mượn!" });
    if(image) borrowing.damageImage = image;
    borrowing.status = STATUS_ENUM.DAMAGED;
    borrowing.damageType = "broken";
    borrowing.damageReason = reason || "Không ghi rõ";
    borrowing.compensationAmount = borrowing.book?.Pricebook ?? borrowing.compensationAmount ?? 50000;
    borrowing.paymentStatus = "pending";
    await borrowing.save();
    res.json({ message:`✅ Đã báo hỏng! Vui lòng thanh toán ${borrowing.compensationAmount.toLocaleString("vi-VN")} VNĐ.`, borrowing });
  } catch(error){
    console.error("❌ Lỗi báo hỏng:", error);
    res.status(500).json({ message:"Lỗi server khi báo hỏng!" });
  }
});

router.put("/:id/report-lost", verifyToken, async (req,res)=>{
  try{
    const borrowing = await Borrowing.findById(req.params.id).populate("book");
    if(!borrowing) return res.status(404).json({ message:"Không tìm thấy đơn mượn!" });
    borrowing.status = STATUS_ENUM.LOST;
    borrowing.damageType = "lost";
    borrowing.compensationAmount = borrowing.book?.Pricebook ?? borrowing.compensationAmount ?? 50000;
    borrowing.paymentStatus = "pending";
    await borrowing.save();
    res.json({ message:`✅ Đã báo mất! Vui lòng thanh toán ${borrowing.compensationAmount.toLocaleString("vi-VN")} VNĐ.`, borrowing });
  } catch(error){
    console.error("❌ Lỗi báo mất:", error);
    res.status(500).json({ message:"Lỗi server khi báo mất!" });
  }
});

router.put("/:id/compensation", verifyToken, requireRole("admin"), async (req,res)=>{
  try{
    const { compensationAmount } = req.body;
    const borrowing = await Borrowing.findByIdAndUpdate(req.params.id, { compensationAmount, status:STATUS_ENUM.COMPENSATED }, { new:true });
    if(!borrowing) return res.status(404).json({ message:"Không tìm thấy đơn mượn!" });
    res.json({ message:"💰 Đã cập nhật tiền đền!", borrowing });
  } catch(error){
    console.error("❌ Lỗi cập nhật tiền đền:", error);
    res.status(500).json({ message:"Lỗi server khi nhập tiền đền!" });
  }
});

router.put("/:id/pay", verifyToken, upload.single("qrCodeImage"), async (req,res)=>{
  try{
    const { paymentMethod, paymentNote } = req.body;
    const qrCodeImage = req.file ? req.file.path : null;
    if(!paymentMethod || !["cash","bank"].includes(paymentMethod)) return res.status(400).json({ message:"Phương thức thanh toán không hợp lệ!" });
    const borrowing = await Borrowing.findById(req.params.id);
    if(!borrowing) return res.status(404).json({ message:"Không tìm thấy đơn mượn!" });
    if(req.user.role!=="admin" && borrowing.user.toString()!==req.user.id) return res.status(403).json({ message:"Bạn không có quyền thanh toán đơn này!" });
    if(!["damaged","lost"].includes(borrowing.status)) return res.status(400).json({ message:"Chỉ có thể thanh toán khi sách bị hỏng hoặc mất!" });
    if(paymentMethod==="bank" && !qrCodeImage && !borrowing.qrCodeImage) return res.status(400).json({ message:"Vui lòng upload ảnh QR code khi thanh toán qua ngân hàng!" });

    const updateData = {
      paymentMethod,
      paymentStatus: paymentMethod==="cash"?"completed":"pending",
      paymentDate: paymentMethod==="cash"?new Date():null,
      paymentNote: paymentNote||"",
      status: paymentMethod==="cash"?STATUS_ENUM.COMPENSATED:borrowing.status,
    };
    if(qrCodeImage) updateData.qrCodeImage = qrCodeImage;
    if(paymentMethod==="bank" && borrowing.qrCodeImage && !qrCodeImage) updateData.qrCodeImage = borrowing.qrCodeImage;

    const updated = await Borrowing.findByIdAndUpdate(req.params.id, updateData, { new:true });
    res.json({ message: paymentMethod==="cash"?"✅ Đã thanh toán bằng tiền mặt thành công!":"✅ Đã gửi thông tin thanh toán qua ngân hàng! Vui lòng chờ xác nhận.", borrowing: updated });
  } catch(error){
    console.error("❌ Lỗi thanh toán:", error);
    res.status(500).json({ message:"Lỗi server khi xử lý thanh toán!" });
  }
});

router.put("/:id/confirm-payment", verifyToken, requireRole("admin"), async (req,res)=>{
  try{
    const borrowing = await Borrowing.findByIdAndUpdate(req.params.id, { paymentStatus:"completed", paymentDate:new Date(), status:STATUS_ENUM.COMPENSATED }, { new:true });
    if(!borrowing) return res.status(404).json({ message:"Không tìm thấy đơn mượn!" });
    res.json({ message:"✅ Đã xác nhận thanh toán thành công!", borrowing });
  } catch(error){
    console.error("❌ Lỗi xác nhận thanh toán:", error);
    res.status(500).json({ message:"Lỗi server khi xác nhận thanh toán!" });
  }
});

router.put("/:id/return", verifyToken, requireRole("admin"), async (req,res)=>{
  try{
    const borrowing = await Borrowing.findById(req.params.id);
    if(!borrowing) return res.status(404).json({ message:"Không tìm thấy đơn mượn!" });
    if(borrowing.status===STATUS_ENUM.RETURNED) return res.status(400).json({ message:"Đơn mượn này đã được trả trước đó!" });

    const previousStatus = borrowing.status;
    const returnQty = borrowing.quantity||1;

    borrowing.status = STATUS_ENUM.RETURNED;
    borrowing.returnDate = new Date();
    await borrowing.save();

    if(previousStatus===STATUS_ENUM.BORROWED && borrowing.book){
      const book = await Book.findById(borrowing.book);
      if(book){
        book.available += returnQty;
        if(book.available>book.quantity) book.available = book.quantity;
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
