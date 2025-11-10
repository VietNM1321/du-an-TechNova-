import React, { useState } from "react";
import axios from "axios";
import { message, Button, Input, DatePicker, Upload, Form } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const AddNotification = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

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

      await axios.post("http://localhost:5000/api/notifications", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Thêm thông báo thành công!");
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi thêm thông báo!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">📝 Tạo thông báo mới</h2>

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
          <DatePicker
            format="YYYY-MM-DD"
            className="w-full"
            defaultValue={dayjs()}
          />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Item label="Ảnh minh họa" name="image" valuePropName="file">
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>

          <Form.Item label="File Word (.docx)" name="wordFile" valuePropName="file">
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Chọn file Word</Button>
            </Upload>
          </Form.Item>

          <Form.Item label="File Excel (.xlsx)" name="excelFile" valuePropName="file">
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Chọn file Excel</Button>
            </Upload>
          </Form.Item>
        </div>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full mt-4"
          >
            Lưu thông báo
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddNotification;
