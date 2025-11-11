import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

const NotificationDetail = ({ show, onClose, currentUser }) => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotifId, setSelectedNotifId] = useState("");

  useEffect(() => {
    if (!show) return; // chỉ fetch khi show = true
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/notifications");
        let data = res.data;

        // Lọc theo role
        if (currentUser?.role === "admin") {
          data = data.filter((n) => n.type === "system");
        } else if (currentUser?.role === "student") {
          data = data.filter(
            (n) =>
              n.type === "system" ||
              (n.type === "reminder" && n.userId?._id === currentUser._id)
          );
        }

        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setNotifications(data);

        // Chỉ set default nếu chưa có selected
        if (data.length > 0 && !selectedNotifId) {
          setSelectedNotifId(data[0]._id);
        }
      } catch (err) {
        console.error("Lỗi khi tải thông báo:", err);
      }
    };

    fetchNotifications();
  }, [show, currentUser, selectedNotifId]);

  const selectedNotif = notifications.find((n) => n._id === selectedNotifId);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-xl font-bold"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-3xl font-semibold mb-6 text-center text-blue-700">
          📢 Chi tiết thông báo
        </h2>

        {/* Chọn thông báo */}
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

        {selectedNotif ? (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-2xl font-bold text-blue-600 mb-3">{selectedNotif.title}</h3>
            <p className="text-gray-600 mb-2">
              <strong>Ngày:</strong> {dayjs(selectedNotif.createdAt).format("DD/MM/YYYY HH:mm")}
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Loại thông báo:</strong>{" "}
              {selectedNotif.type === "system" ? "Chung" : "Nhắc nhở"}
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
                className="text-blue-600 hover:underline block mb-2"
              >
                📄 Tải file Word
              </a>
            )}

            {selectedNotif.data?.excelFile && (
              <a
                href={`http://localhost:5000/${selectedNotif.data.excelFile}`}
                download
                className="text-green-600 hover:underline block mb-2"
              >
                📊 Tải file Excel
              </a>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center italic">
            Chọn một thông báo để xem chi tiết
          </p>
        )}
      </div>
    </div>
  );
};

export default NotificationDetail;
