import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";

const NotificationDetail = () => {
  const { id } = useParams(); // id thông báo
  const [notification, setNotification] = useState(null);
  const [allNotifs, setAllNotifs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/notifications");
        setAllNotifs(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!id) return;
    const notif = allNotifs.find((n) => n._id === id);
    setNotification(notif || null);
  }, [id, allNotifs]);

  const handleChangeDate = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    const notif = allNotifs.find((n) => dayjs(n.date).format("YYYY-MM-DD") === date);
    setNotification(notif || null);
  };

  if (!notification) return <p className="p-6">Chọn thông báo để xem chi tiết</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">{notification.title}</h2>
      <p className="text-gray-500 mb-2">{dayjs(notification.date).format("DD/MM/YYYY")}</p>
      <p className="mb-4">{notification.description}</p>

      {notification.image && (
        <img src={`http://localhost:5000/${notification.image}`} alt="minh họa" className="mb-4 max-w-full rounded" />
      )}
      {notification.wordFile && (
        <a href={`http://localhost:5000/${notification.wordFile}`} download className="text-blue-600 hover:underline block mb-2">
          Tải file Word
        </a>
      )}
      {notification.excelFile && (
        <a href={`http://localhost:5000/${notification.excelFile}`} download className="text-blue-600 hover:underline block mb-2">
          Tải file Excel
        </a>
      )}

      <div className="mt-4">
        <label className="block mb-1 font-semibold">Chọn ngày khác:</label>
        <input
          type="date"
          value={selectedDate || dayjs(notification.date).format("YYYY-MM-DD")}
          onChange={handleChangeDate}
          className="border border-gray-300 rounded px-3 py-2"
        />
      </div>
    </div>
  );
};

export default NotificationDetail;
