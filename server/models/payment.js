import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    txnRef: { type: String, index: true },
    borrowing: { type: mongoose.Schema.Types.ObjectId, ref: "Borrowing" },
    amount: { type: Number },
    status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    provider: { type: String, default: "vnpay" },
    rawPayload: { type: Object },
    responseData: { type: Object },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", PaymentSchema);
