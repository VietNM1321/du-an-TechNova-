import express from "express";
import crypto from "crypto";
import axios from "axios";
import Borrowing from "../models/borrowings.js";
import Payment from "../models/payment.js";
const router = express.Router();
function formatDateYMDHMS(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}
function buildSecureHash(secret, params) {
  const sortedKeys = Object.keys(params).sort();
  const signData = sortedKeys
    .map((k) => `${k}=${encodeURIComponent(params[k])}`)
    .join("&");
  return crypto.createHmac("sha512", secret).update(signData).digest("hex");
}
router.get("/", (req, res) => {
  res.json({ message: "VNPay/order routes active" });
});
router.get("/create_payment_url", async (req, res) => {
  try {
    const {
      VNP_URL,
      VNP_TMNCODE,
      VNP_HASH_SECRET,
      VNP_RETURN_URL,
    } = process.env;
    if (!VNP_URL || !VNP_TMNCODE || !VNP_HASH_SECRET || !VNP_RETURN_URL) {
      return res.status(400).json({
        error:
          "Missing VNPay configuration. Set VNP_URL, VNP_TMNCODE, VNP_HASH_SECRET, VNP_RETURN_URL in .env",
      });
    }
    const amount = Number(req.query.amount || 10000); // VND
    const orderInfo = req.query.orderInfo || "Thanh toan don hang";
    const ipAddr = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const date = new Date();
    const createDate = formatDateYMDHMS(date);
    const orderId = Date.now().toString();
    const vnpParams = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: VNP_TMNCODE,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: "other",
      vnp_Amount: String(amount * 100),
      vnp_ReturnUrl: VNP_RETURN_URL,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };
    const vnp_SecureHash = buildSecureHash(VNP_HASH_SECRET, vnpParams);
    const query = Object.keys(vnpParams)
      .map((k) => `${k}=${encodeURIComponent(vnpParams[k])}`)
      .join("&");
    const paymentUrl = `${VNP_URL}?${query}&vnp_SecureHash=${vnp_SecureHash}`;
    if (req.query.redirect === "1") {
      return res.redirect(paymentUrl);
    }
    res.json({ url: paymentUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to create payment url" });
  }
});
router.post("/create_payment_for_borrowing", async (req, res) => {
  try {
    console.log("📝 Request body:", req.body);
    const {
      VNP_URL,
      VNP_TMNCODE,
      VNP_HASH_SECRET,
      VNP_RETURN_URL,
    } = process.env;
    console.log("🔧 VNP Config check:", { VNP_URL: !!VNP_URL, VNP_TMNCODE: !!VNP_TMNCODE, VNP_HASH_SECRET: !!VNP_HASH_SECRET, VNP_RETURN_URL: !!VNP_RETURN_URL });
    if (!VNP_URL || !VNP_TMNCODE || !VNP_HASH_SECRET || !VNP_RETURN_URL) {
      return res.status(400).json({
        error:
          "Missing VNPay configuration. Set VNP_URL, VNP_TMNCODE, VNP_HASH_SECRET, VNP_RETURN_URL in .env",
      });
    }
    const { borrowingId, amount: rawAmount } = req.body;
    if (!borrowingId) return res.status(400).json({ error: "Missing borrowingId" });

    console.log("🔍 Finding borrowing with ID:", borrowingId);
    const borrowing = await Borrowing.findById(borrowingId).catch(e => {
      console.error("❌ Error querying Borrowing:", e);
      throw e;
    });
    if (!borrowing) return res.status(404).json({ error: "Borrowing not found" });

    const amount = Number(rawAmount || borrowing.compensationAmount || 0) || 0;
    const txnRef = String(borrowing._id);
    
    // Update only vnpTxnRef to avoid validation issues with paymentMethod
    await Borrowing.updateOne(
      { _id: borrowingId },
      { vnpTxnRef: txnRef }
    ).catch(e => {
      console.error("❌ Error updating borrowing:", e);
      throw e;
    });
    
    try {
      const p = new Payment({
        txnRef,
        borrowing: borrowing._id,
        amount,
        status: "pending",
      });
      await p.save().catch(e => {
        console.error("⚠️ Warning: Could not save payment record:", e);
      });
    } catch (e) {
      console.error("⚠️ Warning: Unable to create payment record:", e);
    }

    const ipAddr = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const createDate = formatDateYMDHMS(new Date());

    const vnpParams = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: VNP_TMNCODE,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `borrowing:${txnRef}`,
      vnp_OrderType: "other",
      vnp_Amount: String(amount * 100),
      vnp_ReturnUrl: VNP_RETURN_URL,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };
    console.log("📦 VNP Params:", vnpParams);
    const vnp_SecureHash = buildSecureHash(VNP_HASH_SECRET, vnpParams);
    console.log("🔐 VNP SecureHash:", vnp_SecureHash);
    const query = Object.keys(vnpParams)
      .map((k) => `${k}=${encodeURIComponent(vnpParams[k])}`)
      .join("&");

    const paymentUrl = `${VNP_URL}?${query}&vnp_SecureHash=${vnp_SecureHash}`;
    console.log("✅ Payment URL created successfully");
    res.json({ url: paymentUrl, txnRef });
  } catch (err) {
    console.error("❌ Error in create_payment_for_borrowing:", err.message);
    console.error("Full error:", err);
    res.status(500).json({ error: "Unable to create payment for borrowing", details: err.message });
  }
});
router.post("/ipn", express.urlencoded({ extended: false }), async (req, res) => {
  try {
    const { VNP_HASH_SECRET } = process.env;
    if (!VNP_HASH_SECRET) {
      return res.status(400).json({ error: "Missing VNP_HASH_SECRET in env" });
    }

    const vnpData = { ...req.body };
    const vnp_SecureHash = vnpData.vnp_SecureHash;
    delete vnpData.vnp_SecureHash;

    const generatedHash = buildSecureHash(VNP_HASH_SECRET, vnpData);
    if (generatedHash === vnp_SecureHash) {
      const txnRef = vnpData.vnp_TxnRef || (vnpData.vnp_OrderInfo || "").replace("borrowing:", "");
      if (txnRef) {
        try {
          const payment = await Payment.findOneAndUpdate(
            { txnRef },
            { $set: { rawPayload: vnpData, responseData: vnpData } },
            { upsert: true, new: true }
          );
          const success = vnpData.vnp_ResponseCode === "00" || vnpData.vnp_TransactionStatus === "00";
          payment.status = success ? "paid" : "failed";
          payment.responseData = vnpData;
          await payment.save();
          const b = (await Borrowing.findOne({ vnpTxnRef: txnRef })) || (await Borrowing.findById(txnRef));
          if (b && success) {
            b.paymentMethod = "bank";
            b.paymentStatus = "completed";
            b.paymentDate = new Date();
            await b.save();
          }
        } catch (e) {
          console.error("Error updating payment/borrowing after IPN:", e);
        }
      }
      return res.json({ RspCode: "00", Message: "Confirm Success" });
    }
    return res.status(400).json({ RspCode: "97", Message: "Invalid signature" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "IPN processing error" });
  }
});
router.get("/querydr", async (req, res) => {
  const { VNP_QUERY_URL, VNP_TMNCODE, VNP_HASH_SECRET } = process.env;
  if (!VNP_QUERY_URL || !VNP_TMNCODE || !VNP_HASH_SECRET)
    return res.status(400).json({ error: "Missing VNPay query config" });

  try {
    const { txnRef } = req.query;
    if (!txnRef) return res.status(400).json({ error: "Missing txnRef" });
    const params = {
      vnp_Version: "2.1.0",
      vnp_Command: "querydr",
      vnp_TmnCode: VNP_TMNCODE,
      vnp_TxnRef: txnRef,
      vnp_CreateDate: formatDateYMDHMS(new Date()),
    };
    const secureHash = buildSecureHash(VNP_HASH_SECRET, params);
    const query = Object.keys(params)
      .map((k) => `${k}=${encodeURIComponent(params[k])}`)
      .join("&");

    const url = `${VNP_QUERY_URL}?${query}&vnp_SecureHash=${secureHash}`;
    const r = await axios.get(url);
    res.json(r.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Query error" });
  }
});
router.get("/verify", async (req, res) => {
  try {
    const { txnRef } = req.query;
    if (!txnRef) return res.status(400).json({ error: "Missing txnRef" });
    const payment = await Payment.findOne({ txnRef }).populate("borrowing");
    if (payment) return res.json({ payment, borrowing: payment.borrowing });
    const b = await Borrowing.findOne({ vnpTxnRef: txnRef });
    if (b) return res.json({ borrowing: b });
    res.status(404).json({ error: "Not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Verify error" });
  }
});
export default router;