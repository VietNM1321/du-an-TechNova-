import express from "express";
import moment from "moment";
import qs from "qs";
import crypto from "crypto";
const router = express.Router();
router.post("/create_payment_for_borrowing", (req, res) => {
  try {
    const { amount, borrowId } = req.body;
    if (!amount || !borrowId) {
      return res.status(400).json({ message: "Thiếu amount hoặc borrowId" });
    }
    const vnp_TmnCode = process.env.VNP_TMNCODE;
    const vnp_HashSecret = process.env.VNP_HASHSECRET;
    const vnp_Url = process.env.VNP_URL;
    const vnp_ReturnUrl = process.env.VNP_RETURNURL;
    const createDate = moment().format("YYYYMMDDHHmmss");
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
      vnp_TxnRef: borrowId,
      vnp_OrderInfo: `Thanh toán phí mượn sách #${borrowId}`,
      vnp_OrderType: "other",
      vnp_Amount: amount * 100,
      vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    params = sortObject(params);

    const signData = qs.stringify(params, { encode: false });
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    params["vnp_SecureHash"] = signed;

    const paymentUrl = vnp_Url + "?" + qs.stringify(params, { encode: false });

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

export default router;
