import React, { useState } from "react";
import axios from "axios";
import { message } from "antd";

// props: mode = "add" | "edit", notificationData = {...}, onSuccess = callback
const AddNotification = ({ mode = "add", notificationData = {}, onSuccess }) => {
  const [title, setTitle] = useState(notificationData.title || "");
  const [messageText, setMessageText] = useState(notificationData.message || "");
  const [type, setType] = useState(notificationData.type || "general");
  const [studentCode, setStudentCode] = useState(notificationData.studentCode || "");
  const [imageFile, setImageFile] = useState(null);
  const [wordFile, setWordFile] = useState(null);
  const [excelFile, setExcelFile] = useState(null);
  const [date, setDate] = useState(notificationData.createdAt ? new Date(notificationData.createdAt).toISOString().slice(0,16) : "");

  // Lấy đường dẫn file hiện có nếu đang chỉnh sửa
  const existingImage = notificationData.data?.image ? `http://localhost:5000/${notificationData.data.image}` : null;
  const existingWord = notificationData.data?.wordFile ? `http://localhost:5000/${notificationData.data.wordFile}` : null;
  const existingExcel = notificationData.data?.excelFile ? `http://localhost:5000/${notificationData.data.excelFile}` : null;

  const handleSubmit = async () => {
    try {
      if (type === "reminder" && !studentCode) {
        message.error("Bạn cần nhập mã sinh viên!");
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("message", messageText);
      formData.append("type", type);
      if (type === "reminder") formData.append("studentCode", studentCode);
      if (imageFile) formData.append("image", imageFile);
      if (wordFile) formData.append("wordFile", wordFile);
      if (excelFile) formData.append("excelFile", excelFile);
      if (date) formData.append("date", date);

      let res;
      if (mode === "edit") {
        res = await axios.put(`http://localhost:5000/api/notifications/${notificationData._id}`, formData);
        message.success("Cập nhật thông báo thành công!");
      } else {
        res = await axios.post("http://localhost:5000/api/notifications", formData);
        message.success("Tạo thông báo thành công!");
      }

      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      console.error(err);
      message.error(mode === "edit" ? "Cập nhật thất bại!" : "Tạo thông báo thất bại!");
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="flex flex-col gap-2"
    >
      <input type="text" placeholder="Tiêu đề" value={title} onChange={e => setTitle(e.target.value)} required className="p-2 border rounded"/>
      <textarea placeholder="Nội dung thông báo" value={messageText} onChange={e => setMessageText(e.target.value)} required className="p-2 border rounded"/>
      <select value={type} onChange={e => setType(e.target.value)} className="p-2 border rounded">
        <option value="general">Chung</option>
        <option value="reminder">Nhắc nhở</option>
      </select>
      {type === "reminder" && (
        <input type="text" placeholder="Mã sinh viên" value={studentCode} onChange={e => setStudentCode(e.target.value)} required className="p-2 border rounded"/>
      )}
      <label>Ngày tạo:</label>
      <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="p-2 border rounded"/>

      {/* Ảnh minh họa */}
      <label>Ảnh minh họa:</label>
      {existingImage && !imageFile && (
        <div className="mb-2">
          <img src={existingImage} alt="Hiện có" width={120} className="mb-1 border rounded"/>
          <div className="text-sm text-gray-600">Ảnh hiện tại. Upload mới để thay thế.</div>
        </div>
      )}
      <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />

      {/* File Word */}
      <label>File Word:</label>
      {existingWord && !wordFile && (
        <div className="mb-2">
          <a href={existingWord} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Xem file hiện có</a>
          <div className="text-sm text-gray-600">Upload mới để thay thế.</div>
        </div>
      )}
      <input type="file" accept=".doc,.docx" onChange={e => setWordFile(e.target.files[0])} />

      {/* File Excel */}
      <label>File Excel:</label>
      {existingExcel && !excelFile && (
        <div className="mb-2">
          <a href={existingExcel} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Xem file hiện có</a>
          <div className="text-sm text-gray-600">Upload mới để thay thế.</div>
        </div>
      )}
      <input type="file" accept=".xls,.xlsx" onChange={e => setExcelFile(e.target.files[0])} />

      <button type="submit" className="bg-blue-600 text-white p-2 mt-2 rounded">{mode === "edit" ? "Cập nhật" : "Tạo thông báo"}</button>
    </form>
  );
};

export default AddNotification;
