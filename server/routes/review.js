import express from "express";
import Review from "../models/review.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.bookId) filter.bookId = req.query.bookId;

    const reviews = await Review.find(filter)
      .populate("userId", "fullName email")
      .populate("bookId", "title");

    res.json(reviews);
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

router.post("/", async (req, res) => {
  try {
    const { bookId, rating, comment, userId } = req.body;

    if (!bookId || !rating) {
      return res.status(400).json({ message: "bookId và rating là bắt buộc" });
    }

    const reviewData = { bookId, rating, comment };
    if (userId) {
      reviewData.userId = userId;
    }

    const newReview = new Review(reviewData);
    await newReview.save();

    // Populate userId và bookId trước khi trả về
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
