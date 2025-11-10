import { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";

const NotificationDetail = ({ show, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/notifications");
        setNotifications(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();
  }, []);

  // Khi thay đổi ngày
  const handleChangeDate = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    const notif = notifications.find(
      (n) => dayjs(n.createdAt).format("YYYY-MM-DD") === date
    );
    setSelectedNotif(notif || null);
  };

  // Khi show popup mới
  useEffect(() => {
    if (show) {
      setSelectedNotif(null);
      setSelectedDate("");
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 font-bold"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4">Chi tiết thông báo</h2>

        {/* Chọn ngày */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Chọn ngày:</label>
          <select
            className="border border-gray-300 rounded px-3 py-2 w-full"
            value={selectedDate}
            onChange={handleChangeDate}
          >
            <option value="">-- Chọn ngày --</option>
            {notifications.map((n) => (
              <option
                key={n._id}
                value={dayjs(n.createdAt).format("YYYY-MM-DD")}
              >
                {dayjs(n.createdAt).format("DD/MM/YYYY")} - {n.title}
              </option>
            ))}
          </select>
        </div>

        {selectedNotif ? (
          <div>
            <h3 className="text-xl font-semibold mb-2">{selectedNotif.title}</h3>
            <p className="text-gray-500 mb-4">
              Ngày: {dayjs(selectedNotif.createdAt).format("DD/MM/YYYY")}
            </p>
            <p className="mb-4">{selectedNotif.message}</p>

            {/* Ảnh */}
            {selectedNotif.data?.image && (
              <img
                src={`http://localhost:5000/${selectedNotif.data.image}`}
                alt="minh họa"
                className="mb-4 max-w-full rounded shadow"
              />
            )}

            {/* File Word */}
            {selectedNotif.data?.wordFile && (
              <a
                href={`http://localhost:5000/${selectedNotif.data.wordFile}`}
                download
                className="text-blue-600 hover:underline block mb-2"
              >
                Tải file Word
              </a>
            )}

            {/* File Excel */}
            {selectedNotif.data?.excelFile && (
              <a
                href={`http://localhost:5000/${selectedNotif.data.excelFile}`}
                download
                className="text-blue-600 hover:underline block mb-2"
              >
                Tải file Excel
              </a>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Chọn một ngày để xem thông báo</p>
        )}
      </div>
    </div>
  );
};

export default NotificationDetail;
