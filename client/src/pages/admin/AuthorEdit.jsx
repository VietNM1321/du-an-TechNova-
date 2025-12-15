import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Form, Input, Button, Row, Col, Typography, message, DatePicker, Upload } from "antd";
import { ArrowLeft } from "lucide-react";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const EditAuthor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState("");

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/authors/${id}`);
        const data = res.data;
        
        form.setFieldsValue({
          name: data.name || "",
          bio: data.bio || "",
          dateOfBirth: data.dateOfBirth ? dayjs(data.dateOfBirth) : null,
          dateOfDeath: data.dateOfDeath ? dayjs(data.dateOfDeath) : null,
        });
        
        setCurrentImage(data.image || "");
        setLoading(false);
      } catch (err) {
        console.error("❌ Lỗi lấy dữ liệu tác giả:", err);
        message.error("Không thể tải dữ liệu tác giả!");
        navigate("/admin/author");
      }
    };
    fetchAuthor();
  }, [id, form, navigate]);

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

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("bio", values.bio || "");
      formData.append("dateOfBirth", values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : "");
      formData.append("dateOfDeath", values.dateOfDeath ? values.dateOfDeath.format("YYYY-MM-DD") : "");
      
      if (imageFile) {
        formData.append("image", imageFile.originFileObj || imageFile);
      }

      await axios.put(`http://localhost:5000/api/authors/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      message.success("✅ Cập nhật tác giả thành công!");
      navigate("/admin/author");
    } catch (err) {
      console.error("❌ Lỗi cập nhật tác giả:", err);
      message.error(err.response?.data?.message || "Không thể cập nhật tác giả!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-4">
      <Button
        type="text"
        onClick={() => navigate("/admin/author")}
        className="mb-4 flex items-center gap-2"
      >
        <ArrowLeft size={18} /> Quay lại
      </Button>

      <Card className="shadow-xl rounded-2xl">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={8} className="flex flex-col items-center justify-center">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-6 w-full text-center">
              <Title level={4}>👤 Sửa Tác Giả</Title>
              <Text type="secondary">Cập nhật thông tin và ảnh tác giả</Text>

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
                        ❌ Xóa ảnh mới
                      </Button>
                    </div>
                  ) : currentImage ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={`http://localhost:5000/${currentImage}`}
                        alt="current"
                        className="w-32 h-40 object-cover rounded-lg mb-4 shadow"
                      />
                      <p className="text-xs text-gray-500 mb-2">Ảnh hiện tại</p>
                      <Button
                        type="text"
                        size="small"
                        onClick={() => {
                          setCurrentImage("");
                          message.info("Sẽ xóa ảnh hiện tại");
                        }}
                      >
                        Thay đổi ảnh
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
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                    size="large"
                  >
                    💾 Lưu thay đổi
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

export default EditAuthor;

