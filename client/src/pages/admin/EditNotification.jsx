import React, { useEffect, useState } from "react";
import { Form, Input, Button, DatePicker, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";

const EditNotification = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [existingFiles, setExistingFiles] = useState({}); // lưu ảnh/file hiện tại

  // Load thông báo hiện tại
  const fetchNotification = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/notifications/${id}`);
      const data = res.data;
      setExistingFiles({
        image: data.image || null,
        wordFile: data.wordFile || null,
        excelFile: data.excelFile || null,
      });

      form.setFieldsValue({
        title: data.title,
        description: data.description,
        date: dayjs(data.date),
      });
    } catch (err) {
      console.error(err);
      message.error("Không tải được thông báo!");
    }
  };

  useEffect(() => {
    fetchNotification();
  }, [id]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("date", values.date.format("YYYY-MM-DD"));

      if (values.image?.file) formData.append("image", values.image.file.originFileObj);
      if (values.wordFile?.file) formData.append("wordFile", values.wordFile.file.originFileObj);
      if (values.excelFile?.file) formData.append("excelFile", values.excelFile.file.originFileObj);

      await axios.put(`http://localhost:5000/api/notifications/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Cập nhật thông báo thành công!");
      navigate("/admin/notifications");
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi cập nhật thông báo!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">✏️ Chỉnh sửa thông báo</h2>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Tiêu đề"
          name="title"
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
        >
          <Input placeholder="Nhập tiêu đề thông báo" />
        </Form.Item>

        <Form.Item label="Nội dung" name="description">
          <Input.TextArea rows={4} placeholder="Nhập nội dung chi tiết..." />
        </Form.Item>

        <Form.Item
          label="Ngày thông báo"
          name="date"
          rules={[{ required: true, message: "Vui lòng chọn ngày thông báo!" }]}
        >
          <DatePicker format="YYYY-MM-DD" className="w-full" />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Item label="Ảnh minh họa" name="image" valuePropName="file">
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
            {existingFiles.image && (
              <p className="mt-1 text-sm text-gray-500">Ảnh hiện tại: {existingFiles.image}</p>
            )}
          </Form.Item>

          <Form.Item label="File Word (.docx)" name="wordFile" valuePropName="file">
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Chọn file Word</Button>
            </Upload>
            {existingFiles.wordFile && (
              <p className="mt-1 text-sm text-gray-500">File hiện tại: {existingFiles.wordFile}</p>
            )}
          </Form.Item>

          <Form.Item label="File Excel (.xlsx)" name="excelFile" valuePropName="file">
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Chọn file Excel</Button>
            </Upload>
            {existingFiles.excelFile && (
              <p className="mt-1 text-sm text-gray-500">File hiện tại: {existingFiles.excelFile}</p>
            )}
          </Form.Item>
        </div>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} className="w-full mt-4">
            Cập nhật thông báo
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditNotification;
