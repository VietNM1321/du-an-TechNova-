import React, { useState } from "react";
import { Modal, Input, Upload, Button, message, Radio } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";

const ReportDamageModal = ({ visible, onClose, borrowingId, onSuccess }) => {
  const [damageType, setDamageType] = useState("lost"); // lost | broken
  const [reason, setReason] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (damageType === "broken" && !reason) {
      message.warning("Bạn phải nhập lý do hỏng!");
      return;
    }

    try {
      setLoading(true);

      if (damageType === "lost") {
        await axios.put(`http://localhost:5001/api/borrowings/${borrowingId}/report-lost`);
      } else {
        const formData = new FormData();
        formData.append("reason", reason);
        if (file) formData.append("image", file);

        await axios.put(
          `http://localhost:5001/api/borrowings/${borrowingId}/report-broken`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      message.success(`✅ Báo ${damageType === "lost" ? "mất" : "hỏng"} thành công!`);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("❌ Lỗi báo hỏng/mất:", error.response?.data || error.message);
      message.error("Không thể báo hỏng/mất!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      title="Báo mất/hỏng sách"
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Gửi báo cáo"
      confirmLoading={loading}
    >
      <Radio.Group
        value={damageType}
        onChange={(e) => setDamageType(e.target.value)}
        style={{ marginBottom: 16 }}
      >
        <Radio value="lost">Mất</Radio>
        <Radio value="broken">Hỏng</Radio>
      </Radio.Group>

      {damageType === "broken" && (
        <>
          <Input.TextArea
            placeholder="Nhập lý do hỏng"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            style={{ marginBottom: 12 }}
          />
          <Upload beforeUpload={(f) => { setFile(f); return false; }} maxCount={1}>
            <Button icon={<UploadOutlined />}>Chọn ảnh hỏng</Button>
          </Upload>
        </>
      )}
    </Modal>
  );
};

export default ReportDamageModal;
