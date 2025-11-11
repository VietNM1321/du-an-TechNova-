import React, { useState, useEffect } from "react";
import axios from "axios";
import { message } from "antd";

const AddNotification = ({ mode = "add", notificationData = {}, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [messageText, setMessageText] = useState("");
  const [type, setType] = useState("general");
  const [studentCode, setStudentCode] = useState("");
  const [date, setDate] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [wordFile, setWordFile] = useState(null);
  const [excelFile, setExcelFile] = useState(null);

  useEffect(() => {
    if (mode === "edit" && notificationData) {
      setTitle(notificationData.title || "");
      setMessageText(notificationData.message || "");
      setType(notificationData.type || "general");
      setStudentCode(notificationData.userId?.studentCode || "");
      setDate(notificationData.createdAt ? new Date(notificationData.createdAt).toISOString().slice(0,16) : "");
      setImageFile(null);
      setWordFile(null);
      setExcelFile(null);
    }
  }, [mode, notificationData]);

  const existingFiles = {
    image: notificationData.data?.image ? `http://localhost:5000/${notificationData.data.image}` : null,
    word: notificationData.data?.wordFile ? `http://localhost:5000/${notificationData.data.wordFile}` : null,
    excel: notificationData.data?.excelFile ? `http://localhost:5000/${notificationData.data.excelFile}` : null,
  };

  const handleSubmit = async () => {
    if (type === "reminder" && !studentCode) {
      message.error("Bạn cần nhập mã sinh viên!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("message", messageText);
      formData.append("type", type);
      if (type === "reminder") formData.append("studentCode", studentCode);
      if (date) formData.append("date", date);
      if (imageFile) formData.append("image", imageFile);
      if (wordFile) formData.append("wordFile", wordFile);
      if (excelFile) formData.append("excelFile", excelFile);

      const res =
        mode === "edit"
          ? await axios.put(`http://localhost:5000/api/notifications/${notificationData._id}`, formData)
          : await axios.post("http://localhost:5000/api/notifications", formData);

      message.success(mode === "edit" ? "Cập nhật thành công!" : "Tạo thông báo thành công!");
      onSuccess?.(res.data);
    } catch (err) {
      console.error(err);
      message.error(mode === "edit" ? "Cập nhật thất bại!" : "Tạo thất bại!");
    }
  };

  const renderFileInput = (label, existingUrl, file, setFile, accept) => (
    <div className="mb-2">
      <label>{label}:</label>
      {existingUrl && !file && (
        <div className="mb-1">
          <a href={existingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            Xem file hiện có
          </a>
          <div className="text-sm text-gray-600">Upload mới để thay thế.</div>
        </div>
      )}
      <input type="file" accept={accept} onChange={(e) => setFile(e.target.files[0])} />
    </div>
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex flex-col gap-2">
      <input type="text" placeholder="Tiêu đề" value={title} onChange={(e) => setTitle(e.target.value)} required className="p-2 border rounded" />
      <textarea placeholder="Nội dung thông báo" value={messageText} onChange={(e) => setMessageText(e.target.value)} required className="p-2 border rounded" />

      <select value={type} onChange={(e) => setType(e.target.value)} className="p-2 border rounded">
        <option value="general">Chung</option>
        <option value="reminder">Nhắc nhở</option>
      </select>

      {type === "reminder" && (
        <input type="text" placeholder="Mã sinh viên" value={studentCode} onChange={(e) => setStudentCode(e.target.value)} required className="p-2 border rounded" />
      )}

      <label>Ngày tạo:</label>
      <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="p-2 border rounded" />

      {renderFileInput("Ảnh minh họa", existingFiles.image, imageFile, setImageFile, "image/*")}
      {renderFileInput("File Word", existingFiles.word, wordFile, setWordFile, ".doc,.docx")}
      {renderFileInput("File Excel", existingFiles.excel, excelFile, setExcelFile, ".xls,.xlsx")}

      <button type="submit" className="bg-blue-600 text-white p-2 mt-2 rounded">
        {mode === "edit" ? "Cập nhật" : "Tạo thông báo"}
      </button>
    </form>
  );
};

export default AddNotification;
