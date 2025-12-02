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
 * MỖI LẦN MƯỢN = MỘT MÃ RIÊNG (KHÔNG GỘP)
 */
export async function getOrCreateBorrowingCodeForDay(userId, borrowDate = new Date()) {
  // Luôn tạo mã mới cho mỗi lần mượn (không gộp)
  return await generateBorrowingCode(borrowDate);
}
