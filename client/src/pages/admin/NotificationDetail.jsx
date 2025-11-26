import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";

const NotificationDetail = ({ show, onClose, currentUser }) => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotifId, setSelectedNotifId] = useState("");
  const [filterDate, setFilterDate] = useState(""); // yyyy-MM

  // 🔹 Fetch notifications khi popup mở
  useEffect(() => {
    if (!show) return;

    const fetchNotifications = async () => {
      try {
        let res = await axios.get("http://localhost:5001/api/notifications");
        let data = res.data;

        // Lọc theo user role
        if (currentUser?.role === "admin") {
          data = data.filter((n) => n.type === "system" || n.type === "general");
        } else if (currentUser?.role === "student") {
          data = data.filter(
            (n) =>
              n.type === "system" ||
              (n.type === "reminder" && n.userId?._id === currentUser._id)
          );
        }

        // Filter theo tháng nếu có
        if (filterDate) {
          data = data.filter((n) =>
            dayjs(n.createdAt).format("YYYY-MM") === filterDate
          );
        }

        // Sắp xếp mới nhất
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifications(data);

        // Chọn thông báo đầu tiên nếu chưa chọn
        if (!selectedNotifId && data.length > 0) {
          setSelectedNotifId(data[0]._id);
        }
      } catch (err) {
        console.error("Lỗi khi tải thông báo:", err);
      }
    };

    fetchNotifications();
  }, [show, currentUser, filterDate, selectedNotifId]);

  // Reset khi đóng popup
  useEffect(() => {
    if (!show) {
      setNotifications([]);
      setSelectedNotifId("");
      setFilterDate("");
    }
  }, [show]);

  const selectedNotif = notifications.find((n) => n._id === selectedNotifId);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-xl font-bold"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-3xl font-semibold mb-4 text-center text-blue-700">
          📢 Chi tiết thông báo
        </h2>

        {/* Filter theo tháng */}
        <div className="mb-4 flex gap-2 items-center">
          <label className="font-medium">Chọn tháng:</label>
          <input
            type="month"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1"
          />
        </div>

        {/* Dropdown chọn thông báo */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">Chọn thông báo:</label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
            value={selectedNotifId}
            onChange={(e) => setSelectedNotifId(e.target.value)}
          >
            {notifications.map((n) => (
              <option key={n._id} value={n._id}>
                {dayjs(n.createdAt).format("DD/MM/YYYY HH:mm")} - {n.title}
              </option>
            ))}
          </select>
        </div>

        {/* Nội dung thông báo */}
        <AnimatePresence mode="wait">
          {selectedNotif ? (
            <motion.div
              key={selectedNotif._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-200 pt-4"
            >
              <h3 className="text-2xl font-bold text-blue-600 mb-2">{selectedNotif.title}</h3>
              <p className="text-gray-600 mb-1">
                <strong>Ngày:</strong> {dayjs(selectedNotif.createdAt).format("DD/MM/YYYY HH:mm")}
              </p>
              <p className="text-gray-600 mb-4">
                <strong>Loại:</strong> {selectedNotif.type === "system" ? "Chung" : "Nhắc nhở"}
              </p>

              <div className="bg-gray-50 border rounded-lg p-4 mb-4">
                <p className="whitespace-pre-line leading-relaxed text-gray-800">
                  {selectedNotif.message}
                </p>
              </div>

              {selectedNotif.data?.image && (
                <div className="mb-4">
                  <p className="font-medium mb-2 text-gray-700">Ảnh minh họa:</p>
                  <img
                    src={`http://localhost:5001/${selectedNotif.data.image}`}
                    alt="minh họa"
                    className="rounded-lg shadow max-w-full border"
                  />
                </div>
              )}

              {selectedNotif.data?.wordFile && (
                <a
                  href={`http://localhost:5001/${selectedNotif.data.wordFile}`}
                  download
                  className="text-blue-600 hover:underline block mb-2"
                >
                  📄 Tải file Word
                </a>
              )}

              {selectedNotif.data?.excelFile && (
                <a
                  href={`http://localhost:5001/${selectedNotif.data.excelFile}`}
                  download
                  className="text-green-600 hover:underline block mb-2"
                >
                  📊 Tải file Excel
                </a>
              )}
            </motion.div>
          ) : (
            <motion.p
              key="noNotif"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-gray-500 text-center italic"
            >
              Không có thông báo nào
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default NotificationDetail;
