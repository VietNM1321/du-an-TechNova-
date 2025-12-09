import ImportWarehouse from "../models/importWarehouse.js";

/**
 * Tạo mã phiếu nhập kho
 * Format: IMPORT-YYYYMMDD-XXXXXX
 * VD: IMPORT-20250110-000001
 */
export const generateImportCode = async () => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const date = String(today.getDate()).padStart(2, "0");
    const dateStr = `${year}${month}${date}`;
    const prefix = `IMPORT-${dateStr}`;

    // Lấy số lượng phiếu nhập hôm nay
    const startOfDay = new Date(year, today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(year, today.getMonth(), today.getDate(), 23, 59, 59);

    const count = await ImportWarehouse.countDocuments({
      importDate: { $gte: startOfDay, $lt: endOfDay },
    });

    const sequence = String(count + 1).padStart(6, "0");
    const importCode = `${prefix}-${sequence}`;

    return importCode;
  } catch (err) {
    console.error("❌ Lỗi tạo mã phiếu nhập:", err);
    throw err;
  }
};
