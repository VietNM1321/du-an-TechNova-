import express from "express";
import Review from "../models/review.js";
import Borrowing from "../models/borrowings.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.bookId) filter.bookId = req.query.bookId;
    if (req.query.bookId) {
      const reviews = await Review.find(filter)
        .populate("userId", "fullName email")
        .populate("bookId", "title")
        .sort({ createdAt: -1 }); // Sắp xếp mới nhất trước

      return res.json(reviews);
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .populate("userId", "fullName email")
      .populate("bookId", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json({
      reviews,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy đánh giá", error });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("userId", "fullName email")
      .populate("bookId", "title");

    if (!review) return res.status(404).json({ message: "Không tìm thấy đánh giá" });

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy đánh giá", error });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const { bookId, rating, comment } = req.body;
    const userId = req.user?.id;

    if (!bookId || !rating || !userId) {
      return res.status(400).json({ message: "Thiếu thông tin đánh giá" });
    }
    const hasReturned = await Borrowing.findOne({
      user: userId,
      book: bookId,
      status: "returned",
      returnDate: { $ne: null },
    });
    if (!hasReturned) {
      return res.status(403).json({
        message: "Bạn chỉ có thể bình luận sau khi đã trả sách.",
      });
    }
    const reviewData = { bookId, rating, comment, userId };
    const newReview = new Review(reviewData);
    await newReview.save();
    await newReview.populate("userId", "fullName email");
    await newReview.populate("bookId", "title");

    res.status(201).json(newReview);
  } catch (error) {
    res.status(400).json({ message: "Thêm review thất bại", error });
  }
});
router.put("/:id", async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      { rating, comment },
      { new: true }
    );
    if (!updatedReview) return res.status(404).json({ message: "Không tìm thấy đánh giá để cập nhật" });
    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: "Cập nhật đánh giá thất bại", error });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);

    if (!deletedReview) return res.status(404).json({ message: "Không tìm thấy đánh giá để xóa" });

    res.json({ message: "Đánh giá đã được xóa" });
  } catch (error) {
    res.status(500).json({ message: "Xóa đánh giá thất bại", error });
  }
});

export default router;
