import express from "express";
import qs from "qs";
import crypto from "crypto";
import Payment from "../models/payment.js";
import Borrowing from "../models/borrowings.js";
const router = express.Router();
router.post("/create_payment_for_borrowing", (req, res) => {
  try {
    const { amount, borrowId, borrowingId } = req.body;
    const finalBorrowId = borrowingId || borrowId;
    if (!amount || !finalBorrowId) {
      return res.status(400).json({ message: "Thiếu amount hoặc borrowId/borrowingId" });
    }
    const vnp_TmnCode = process.env.VNP_TMNCODE;
    const vnp_HashSecret = process.env.VNP_HASH_SECRET;
    const vnp_Url = process.env.VNP_URL;
    const vnp_ReturnUrl = process.env.VNP_RETURN_URL;
    const now = new Date();
    const createDate = String(now.getFullYear()) + 
      String(now.getMonth() + 1).padStart(2, '0') + 
      String(now.getDate()).padStart(2, '0') + 
      String(now.getHours()).padStart(2, '0') + 
      String(now.getMinutes()).padStart(2, '0') + 
      String(now.getSeconds()).padStart(2, '0');
    let ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      "127.0.0.1";
    let params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: finalBorrowId,
      vnp_OrderInfo: `Thanh toán phí mượn sách #${finalBorrowId}`,
      vnp_OrderType: "other",
      vnp_Amount: amount * 100,
      vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };
    params = sortObject(params);
    const signData = Object.keys(params).map((k) => `${k}=${encodeURIComponent(params[k])}`).join("&");
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    // build query with encoded values to match how VNPAY expects
    const query = Object.keys(params).map((k) => `${k}=${encodeURIComponent(params[k])}`).join("&");
    const paymentUrl = vnp_Url + "?" + query + `&vnp_SecureHash=${signed}`;
    console.log("✅ VNP_RETURN_URL =", vnp_ReturnUrl);
    console.log("✅ paymentUrl =", paymentUrl);
    return res.json({ paymentUrl });
  } catch (err) {
    console.log("VNPAY ERROR:", err);
    return res.status(500).json({ message: "Lỗi tạo thanh toán VNPAY" });
  }
});
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  keys.forEach((key) => (sorted[key] = obj[key]));
  return sorted;
}
router.get("/vnpay_return", (req, res) => {
  const vnp_Params = req.query;
  const secureHash = vnp_Params.vnp_SecureHash;
  delete vnp_Params.vnp_SecureHash;
  delete vnp_Params.vnp_SecureHashType;
  const sortedParams = sortObject(vnp_Params);
  const signData = Object.keys(sortedParams).map((k) => `${k}=${encodeURIComponent(sortedParams[k])}`).join("&");
  const hmac = crypto.createHmac("sha512", process.env.VNP_HASH_SECRET);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  const borrowId = vnp_Params.vnp_TxnRef;
  const responseCode = vnp_Params.vnp_ResponseCode;
  console.log("📥 VNPAY /vnpay_return called");
  console.log("   borrowId:", borrowId, "responseCode:", responseCode);
  console.log("   hash valid:", secureHash === signed);
  (async () => {
    try {
      const valid = secureHash === signed;
      const success = responseCode === "00";
      console.log("   Processing: valid=" + valid + ", success=" + success);
      if (valid && success) {
        try {
          const txnRef = borrowId;
          let payment = await Payment.findOne({ txnRef });
          if (!payment) {
            payment = new Payment({ txnRef, borrowing: txnRef, amount: 0, status: "paid" });
            await payment.save().catch(() => {});
          } else {
            payment.status = "paid";
            await payment.save().catch(() => {});
          }
          console.log("   ✅ Payment updated:", { txnRef, status: "paid" });
        } catch (e) {
          console.error("   ❌ Error creating/updating Payment on return:", e);
        }
        try {
          const b = (await Borrowing.findOne({ vnpTxnRef: borrowId })) || (await Borrowing.findById(borrowId));
          if (b) {
            b.paymentMethod = "bank";
            b.paymentStatus = "completed";
            b.paymentDate = new Date();
            // mark overall borrowing as compensated so admin shows 'Đã đền bù'
            try {
              b.status = "compensated";
            } catch (e) {}
            await b.save();
            console.log("   ✅ Borrowing updated:", { id: borrowId, paymentStatus: "completed", status: b.status });
          } else {
            console.log("   ⚠️ Borrowing not found for:", borrowId);
          }
        } catch (e) {
          console.error("   ❌ Error updating Borrowing on return:", e);
        }
        console.log("   Redirecting to payment-success");
        return res.redirect(`http://localhost:5173/payment-success?borrowId=${borrowId}`);
      }
      console.log("   ⚠️ Not redirecting to success. Redirecting to payment-fail");
      return res.redirect(`http://localhost:5173/payment-fail?borrowId=${borrowId}`);
    } catch (err) {
      console.error("Error processing vnpay_return:", err);
      return res.redirect(`http://localhost:5173/payment-fail?borrowId=${borrowId}`);
    }
  })();
});
export default router;
