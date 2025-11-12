import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Typography,
  message,
} from "antd";

const { Title, Text } = Typography;

const AddCategory = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/category", values);
      message.success("✅ Thêm danh mục thành công!");
      navigate("/admin/category");
    } catch (err) {
      console.error("Create category error:", err.response?.data || err.message);
      message.error(err.response?.data?.message || "❌ Lỗi khi thêm danh mục!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <Card className="shadow-xl rounded-2xl">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={6} className="text-center">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-6 flex flex-col items-center">
              <div className="bg-blue-100 rounded-full w-24 h-24 flex items-center justify-center mb-4">
                <span style={{ fontSize: 40 }}>📂</span>
              </div>
              <Title level={4} className="mb-0">Danh mục</Title>
              <Text type="secondary">Tổ chức sách</Text>
            </div>
          </Col>

          <Col xs={24} md={18}>
            <Title level={3} className="mb-1">➕ Thêm danh mục mới</Title>
            <Text type="secondary">Tạo danh mục để nhóm sách theo chủ đề. Trường có dấu * là bắt buộc.</Text>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="mt-6"
              initialValues={{ name: "", description: "" }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={24}>
                  <Form.Item
                    name="name"
                    label="Tên danh mục"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên danh mục" },
                      { min: 2, message: "Tên danh mục phải có ít nhất 2 ký tự" },
                      { max: 100, message: "Tên danh mục không được quá 100 ký tự" },
                    ]}
                  >
                    <Input size="large" placeholder="Nhập tên danh mục..." />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24}>
                  <Form.Item
                    name="description"
                    label="Mô tả (tùy chọn)"
                    rules={[
                      { max: 500, message: "Mô tả không được quá 500 ký tự" },
                    ]}
                  >
                    <Input.TextArea rows={4} placeholder="Mô tả ngắn về danh mục..." />
                  </Form.Item>
                </Col>

                <Col xs={24} className="flex justify-end gap-3 mt-4">
                  <Button onClick={() => navigate("/admin/category")} size="large">
                    ⬅️ Quay lại
                  </Button>

                  <Button
                    onClick={() => {
                      form.resetFields();
                      message.info("Đã đặt lại form");
                    }}
                    size="large"
                  >
                    🔄 Reset
                  </Button>

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                  >
                    💾 Lưu danh mục
                  </Button>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AddCategory;
