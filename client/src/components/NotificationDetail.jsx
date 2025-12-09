import { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";

const NotificationDetail = ({ show, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotif, setSelectedNotif] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/notifications");
        setNotifications(res.data);
        if (res.data.length > 0) {
          setSelectedNotif(res.data[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();
  }, []);

  // Chọn thông báo từ danh sách
  const handleSelectNotif = (notif) => {
    setSelectedNotif(notif);
  };

  useEffect(() => {
    if (!show) {
      setSelectedNotif(null);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 font-bold text-2xl"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4">📢 Thông báo</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Danh sách thông báo */}
          <div className="md:col-span-1">
            <div className="border rounded-lg overflow-hidden bg-gray-50">
              <div className="bg-blue-600 text-white p-3 font-semibold">
                Danh sách ({notifications.length})
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <button
                      key={notif._id}
                      onClick={() => handleSelectNotif(notif)}
                      className={`w-full text-left p-3 border-b hover:bg-blue-100 transition ${
                        selectedNotif?._id === notif._id ? "bg-blue-100 border-l-4 border-l-blue-600" : ""
                      }`}
                    >
                      <div className="font-semibold text-sm text-gray-900 truncate">
                        {notif.title}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {dayjs(notif.createdAt).format("DD/MM/YYYY")}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-gray-500 text-sm">Không có thông báo nào</div>
                )}
              </div>
            </div>
          </div>

          {/* Chi tiết thông báo */}
          <div className="md:col-span-2">
            {selectedNotif ? (
              <div className="border rounded-lg p-4 bg-white">
                <h3 className="text-xl font-semibold text-blue-600 mb-2">{selectedNotif.title}</h3>
                <p className="text-gray-500 text-sm mb-4">
                  {dayjs(selectedNotif.createdAt).format("DD/MM/YYYY HH:mm")}
                </p>
                <p className="text-gray-800 mb-4 whitespace-pre-line leading-relaxed">
                  {selectedNotif.message}
                </p>

                {selectedNotif.data?.image && (
                  <div className="mb-4">
                    <img
                      src={`http://localhost:5000/${selectedNotif.data.image}`}
                      alt="minh họa"
                      className="rounded shadow max-w-full"
                    />
                  </div>
                )}

                {selectedNotif.data?.wordFile && (
                  <a
                    href={`http://localhost:5000/${selectedNotif.data.wordFile}`}
                    download
                    className="text-blue-600 hover:underline block mb-2 text-sm"
                  >
                    📄 Tải file Word
                  </a>
                )}

                {selectedNotif.data?.excelFile && (
                  <a
                    href={`http://localhost:5000/${selectedNotif.data.excelFile}`}
                    download
                    className="text-green-600 hover:underline block text-sm"
                  >
                    📊 Tải file Excel
                  </a>
                )}
              </div>
            ) : (
              <div className="border rounded-lg p-4 bg-gray-50 text-center text-gray-500">
                Chọn một thông báo để xem chi tiết
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetail;

