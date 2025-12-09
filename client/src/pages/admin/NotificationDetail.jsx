import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";

const NotificationDetail = ({ show, onClose, currentUser }) => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotifId, setSelectedNotifId] = useState("");

  // Fetch notifications khi popup mở
  useEffect(() => {
    if (!show) return;

    const fetchNotifications = async () => {
      try {
        let res = await axios.get("http://localhost:5000/api/notifications");
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
  }, [show, currentUser, selectedNotifId]);

  // Reset khi đóng popup
  useEffect(() => {
    if (!show) {
      setNotifications([]);
      setSelectedNotifId("");
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-xl font-bold"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-3xl font-semibold mb-6 text-center text-blue-700">
          📢 Thông báo
        </h2>

        {/* Grid layout: danh sách + chi tiết */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Danh sách thông báo */}
          <div className="md:col-span-1">
            <div className="border rounded-lg overflow-hidden bg-gray-50">
              <div className="bg-blue-600 text-white p-3 font-semibold text-center">
                📋 Danh sách ({notifications.length})
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <button
                      key={notif._id}
                      onClick={() => setSelectedNotifId(notif._id)}
                      className={`w-full text-left p-3 border-b hover:bg-blue-100 transition text-sm ${
                        selectedNotifId === notif._id
                          ? "bg-blue-100 border-l-4 border-l-blue-600"
                          : ""
                      }`}
                    >
                      <div className="font-semibold text-gray-900 truncate">
                        {notif.title}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {dayjs(notif.createdAt).format("DD/MM/YYYY HH:mm")}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-gray-500 text-sm text-center">
                    Không có thông báo
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chi tiết thông báo */}
          <div className="md:col-span-2">
            <AnimatePresence mode="wait">
              {selectedNotif ? (
                <motion.div
                  key={selectedNotif._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="border rounded-lg p-4 bg-white"
                >
                  <h3 className="text-2xl font-bold text-blue-600 mb-2">
                    {selectedNotif.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    <span className="font-semibold">📅 Ngày:</span>{" "}
                    {dayjs(selectedNotif.createdAt).format("DD/MM/YYYY HH:mm")}
                  </p>
                  <p className="text-gray-600 text-sm mb-4">
                    <span className="font-semibold">📌 Loại:</span>{" "}
                    {selectedNotif.type === "system"
                      ? "Chung"
                      : selectedNotif.type === "general"
                        ? "Tổng quát"
                        : "Nhắc nhở"}
                  </p>

                  <div className="bg-gray-50 border rounded-lg p-4 mb-4">
                    <p className="whitespace-pre-line leading-relaxed text-gray-800">
                      {selectedNotif.message}
                    </p>
                  </div>

                  {selectedNotif.data?.image && (
                    <div className="mb-4">
                      <p className="font-medium text-gray-700 mb-2">
                        🖼️ Ảnh minh họa:
                      </p>
                      <img
                        src={`http://localhost:5000/${selectedNotif.data.image}`}
                        alt="minh họa"
                        className="rounded-lg shadow max-w-full border"
                      />
                    </div>
                  )}

                  {selectedNotif.data?.wordFile && (
                    <a
                      href={`http://localhost:5000/${selectedNotif.data.wordFile}`}
                      download
                      className="text-blue-600 hover:underline block mb-2 text-sm font-medium"
                    >
                      📄 Tải file Word
                    </a>
                  )}

                  {selectedNotif.data?.excelFile && (
                    <a
                      href={`http://localhost:5000/${selectedNotif.data.excelFile}`}
                      download
                      className="text-green-600 hover:underline block text-sm font-medium"
                    >
                      📊 Tải file Excel
                    </a>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="noNotif"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border rounded-lg p-8 bg-gray-50 text-center text-gray-500"
                >
                  <p className="text-lg">Chọn một thông báo để xem chi tiết</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationDetail;

