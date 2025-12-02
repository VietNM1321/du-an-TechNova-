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
  DatePicker,
  Upload,
} from "antd";
import { UserPlus } from "lucide-react";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const AddAuthor = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  const handleImageChange = (file) => {
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
    return false;
  };

  const handleSubmit = async (values) => {
    if (!values.name) {
      message.warning("Vui lòng nhập tên tác giả");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("bio", values.bio || "");
      formData.append("dateOfBirth", values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : "");
      formData.append("dateOfDeath", values.dateOfDeath ? values.dateOfDeath.format("YYYY-MM-DD") : "");
      if (imageFile) {
        formData.append("image", imageFile.originFileObj || imageFile);
      }

      await axios.post("http://localhost:5000/api/authors", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("✅ Thêm tác giả thành công!");
      navigate("/admin/author");
    } catch (error) {
      console.error("Lỗi thêm tác giả:", error);
      message.error(error.response?.data?.message || "❌ Có lỗi xảy ra khi thêm tác giả!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-4">
      <Card className="shadow-xl rounded-2xl">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={8} className="flex flex-col items-center justify-center">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-6 w-full text-center">
              <Title level={4}>👤 Thêm Tác Giả Mới</Title>
              <Text type="secondary">Thêm thông tin và ảnh tác giả</Text>

              <div className="mt-6 w-full">
                <div className="bg-white rounded-lg border-2 border-dashed border-blue-300 p-6">
                  {imagePreview ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={imagePreview}
                        alt="preview"
                        className="w-32 h-40 object-cover rounded-lg mb-4 shadow"
                      />
                      <Button
                        type="text"
                        danger
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                      >
                        ❌ Xóa ảnh
                      </Button>
                    </div>
                  ) : (
                    <Upload
                      maxCount={1}
                      beforeUpload={handleImageChange}
                      listType="picture"
                      accept="image/*"
                    >
                      <div className="text-center cursor-pointer">
                        <UserPlus size={32} className="mx-auto text-blue-400 mb-2" />
                        <div className="text-sm text-gray-600">Tải ảnh tác giả</div>
                      </div>
                    </Upload>
                  )}
                </div>
                <div className="mt-3 text-xs text-gray-500 text-center">
                  Hỗ trợ JPG, PNG. Kích thước tối đa 5MB.
                </div>
              </div>
            </div>
          </Col>

          <Col xs={24} md={16}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                name: "",
                bio: "",
                dateOfBirth: null,
                dateOfDeath: null,
              }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={24}>
                  <Form.Item
                    name="name"
                    label="Tên tác giả"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên tác giả" },
                      { min: 2, message: "Tên phải có ít nhất 2 ký tự" },
                      { max: 100, message: "Tên không được quá 100 ký tự" },
                    ]}
                  >
                    <Input size="large" placeholder="Nhập tên tác giả..." />
                  </Form.Item>
                </Col>

                <Col xs={12} sm={12}>
                  <Form.Item name="dateOfBirth" label="Ngày sinh">
                    <DatePicker
                      style={{ width: "100%" }}
                      size="large"
                      format="DD/MM/YYYY"
                      placeholder="Chọn ngày sinh"
                    />
                  </Form.Item>
                </Col>

                <Col xs={12} sm={12}>
                  <Form.Item name="dateOfDeath" label="Ngày mất">
                    <DatePicker
                      style={{ width: "100%" }}
                      size="large"
                      format="DD/MM/YYYY"
                      placeholder="Chọn ngày mất"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item
                    name="bio"
                    label="Tiểu sử / Mô tả"
                    rules={[
                      { max: 1000, message: "Tiểu sử không được quá 1000 ký tự" },
                    ]}
                  >
                    <Input.TextArea
                      rows={5}
                      placeholder="Nhập tiểu sử, mô tả ngắn về tác giả..."
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} className="flex justify-end gap-3 mt-4">
                  <Button onClick={() => navigate("/admin/author")} size="large">
                    ⬅️ Quay lại
                  </Button>

                  <Button
                    onClick={() => {
                      form.resetFields();
                      setImageFile(null);
                      setImagePreview(null);
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
                    💾 Lưu tác giả
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

export default AddAuthor;

