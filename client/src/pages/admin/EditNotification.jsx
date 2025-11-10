import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AddNotification from "./AddNotification";
import { message, Spin } from "antd";

const NotificationEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        setLoading(true);
        // Lấy thông báo
        const res = await axios.get(`http://localhost:5000/api/notifications/${id}`);
        const data = res.data;

        // Nếu là reminder, lấy studentCode từ user
        if (data.type === "reminder") {
          try {
            const userRes = await axios.get(`http://localhost:5000/api/users/${data.userId}`);
            data.studentCode = userRes.data.studentCode || "";
          } catch {
            data.studentCode = "";
          }
        }

        // Chuyển createdAt về format datetime-local
        if (data.createdAt) {
          data.createdAt = new Date(data.createdAt).toISOString().slice(0, 16);
        }

        setNotification(data);
      } catch (err) {
        console.error(err);
        message.error("Không tải được thông báo");
      } finally {
        setLoading(false);
      }
    };

    fetchNotification();
  }, [id]);

  if (loading) return <Spin tip="Đang tải..." style={{ display: "block", marginTop: 50 }} />;
  if (!notification) return <div>Không tìm thấy thông báo</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Chỉnh sửa thông báo</h2>
      <AddNotification
        mode="edit"
        notificationData={notification}
        onSuccess={() => {
          message.success("Cập nhật thông báo thành công!");
          navigate("/admin/notifications");
        }}
      />
    </div>
  );
};

export default NotificationEdit;
