import mongoose from "mongoose";
const ImportWarehouseSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    quantity: {
      type: Number,
      required: [true, "Vui lòng nhập số lượng nhập kho"],
      min: [1, "Số lượng phải lớn hơn 0"],
    },
    supplier: {
      type: String,
      trim: true,
      default: "Không rõ",
    },
    note: {
      type: String,
      trim: true,
    },
    importDate: {
      type: Date,
      default: Date.now,
    },
    user: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false 
    },
    userLabel: {
      type: String,
      default: "Admin",
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
const ImportWarehouse = mongoose.model("ImportWarehouse", ImportWarehouseSchema);
export default ImportWarehouse;