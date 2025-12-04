import express from "express";
import Borrowing from "../models/borrowings.js";
import User from "../models/User.js";
import Book from "../models/books.js";

const router = express.Router();

router.get("/library", async (req, res) => {
  try {
    // ===== USERS =====
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalLibrarians = await User.countDocuments({ role: "librarian" });
    const activeUsers = await User.countDocuments({ active: true });
    const inactiveUsers = await User.countDocuments({ active: false });

    const usersBorrowed = await Borrowing.distinct("user");
    const countUsersBorrowed = usersBorrowed.length;
    const countUsersNeverBorrowed = totalUsers - countUsersBorrowed;

    // ===== BORROWINGS =====
    const totalBorrowings = await Borrowing.countDocuments();
    const activeBorrowings = await Borrowing.countDocuments({ status: "borrowed" });
    const returnedCount = await Borrowing.countDocuments({ status: "returned" });
    const overdueCount = await Borrowing.countDocuments({ status: "overdue" });
    const damagedCount = await Borrowing.countDocuments({ status: "damaged" });
    const lostCount = await Borrowing.countDocuments({ status: "lost" });

    const compensationAgg = await Borrowing.aggregate([
      { $group: { _id: null, total: { $sum: "$compensationAmount" } } }
    ]);
    const totalCompensation = compensationAgg[0]?.total || 0;

    // STATUS PIE CHART
    const statusStats = await Borrowing.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // MONTHLY CHART
    const monthlyStats = await Borrowing.aggregate([
      {
        $group: {
          _id: { month: { $month: "$borrowDate" } },
          borrowCount: { $sum: 1 },
          returned: {
            $sum: { $cond: [{ $eq: ["$status", "returned"] }, 1, 0] }
          },
          overdue: {
            $sum: { $cond: [{ $eq: ["$status", "overdue"] }, 1, 0] }
          }
        }
      },
      { $sort: { "_id.month": 1 } }
    ]);

    // TOP BORROWED BOOKS
    const topBooks = await Borrowing.aggregate([
      { $group: { _id: "$book", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "book"
        }
      },
      { $unwind: "$book" }
    ]);

    // TOP BORROWERS
    const topBorrowers = await Borrowing.aggregate([
      { $group: { _id: "$user", borrowCount: { $sum: 1 } } },
      { $sort: { borrowCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: "$userInfo" }
    ]);

    return res.json({
      users: {
        totalUsers,
        totalStudents,
        totalAdmins,
        totalLibrarians,
        activeUsers,
        inactiveUsers,
        countUsersBorrowed,
        countUsersNeverBorrowed,
      },
      borrowings: {
        totalBorrowings,
        activeBorrowings,
        returnedCount,
        overdueCount,
        damagedCount,
        lostCount,
        totalCompensation,
        statusStats,
        monthlyStats,
      },
      topBooks,
      topBorrowers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error loading statistics", err });
  }
});

export default router;
