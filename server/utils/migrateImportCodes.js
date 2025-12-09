import ImportWarehouse from "../models/importWarehouse.js";

/**
 * Migrate existing import records without importCode
 * Run this once to generate codes for existing records
 */
export const migrateImportCodes = async () => {
  try {
    // Find all records without importCode
    const recordsWithoutCode = await ImportWarehouse.find({ importCode: { $exists: false } });
    
    if (recordsWithoutCode.length === 0) {
      console.log("✅ Tất cả phiếu nhập đều có mã rồi.");
      return;
    }

    console.log(`🔄 Đang cập nhật ${recordsWithoutCode.length} phiếu nhập...`);

    for (const record of recordsWithoutCode) {
      // Generate code based on importDate or createdAt
      const refDate = record.importDate || record.createdAt;
      const year = refDate.getFullYear();
      const month = String(refDate.getMonth() + 1).padStart(2, "0");
      const date = String(refDate.getDate()).padStart(2, "0");
      const dateStr = `${year}${month}${date}`;

      // Get sequence for that date
      const dayStart = new Date(year, refDate.getMonth(), refDate.getDate(), 0, 0, 0);
      const dayEnd = new Date(year, refDate.getMonth(), refDate.getDate(), 23, 59, 59);

      const countSameDay = await ImportWarehouse.countDocuments({
        importDate: { $gte: dayStart, $lt: dayEnd },
        importCode: { $exists: true, $ne: null },
      });

      const sequence = String(countSameDay + 1).padStart(6, "0");
      const importCode = `IMPORT-${dateStr}-${sequence}`;

      record.importCode = importCode;
      await record.save();
    }

    console.log(`✅ Đã cập nhật thành công ${recordsWithoutCode.length} phiếu nhập!`);
  } catch (err) {
    console.error("❌ Lỗi cập nhật mã phiếu nhập:", err);
    throw err;
  }
};
