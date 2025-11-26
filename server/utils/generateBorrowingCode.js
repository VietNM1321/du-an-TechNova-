import Borrowing from "../models/borrowings.js";

/**
 * Tạo mã đơn mượn duy nhất
 * Format: BRW-YYYYMMDD-XXX
 * Ví dụ: BRW-20250121-001
 */
export async function generateBorrowingCode(borrowDate = new Date()) {
  // Chuẩn hóa ngày (chỉ lấy Y-M-D)
  const date = new Date(borrowDate);
  date.setHours(0, 0, 0, 0);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

  // Tìm số lần tạo mã trong ngày này
  const existingCodes = await Borrowing.find({
    borrowingCode: { $regex: `^BRW-${dateStr}-` }
  }).select("borrowingCode");

  // Lấy số cao nhất từ các mã hiện có
  let maxNumber = 0;
  existingCodes.forEach(item => {
    const match = item.borrowingCode.match(/BRW-\d+-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNumber) maxNumber = num;
    }
  });

  // Tạo mã mới
  const newNumber = String(maxNumber + 1).padStart(3, "0");
  return `BRW-${dateStr}-${newNumber}`;
}

/**
 * Lấy mã đơn mượn cho một user trong một ngày cụ thể
 * Nếu đã có mã, trả về mã cũ (để gộp đơn cùng ngày)
 * Nếu chưa có, tạo mã mới
 */
export async function getOrCreateBorrowingCodeForDay(userId, borrowDate = new Date()) {
  // Chuẩn hóa ngày
  const date = new Date(borrowDate);
  date.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Tìm xem user có mã đơn nào trong ngày này chưa
  const existingBorrowing = await Borrowing.findOne({
    user: userId,
    borrowDate: {
      $gte: date,
      $lte: endOfDay
    },
    borrowingCode: { $exists: true, $ne: null }
  }).select("borrowingCode");

  if (existingBorrowing?.borrowingCode) {
    return existingBorrowing.borrowingCode;
  }

  // Nếu chưa có, tạo mã mới
  return await generateBorrowingCode(borrowDate);
}
