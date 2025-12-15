import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Select, Row, Col, Button, Typography, message, InputNumber } from "antd";
import { ArrowLeft, Package } from "lucide-react";

const { Title, Text } = Typography;

const ImportAdd = () => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/category?limit=1000");
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error(err);
        message.error("Lỗi khi tải danh mục");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = async (categoryId) => {
    form.setFieldValue("bookId", undefined);
    setBooks([]);
    if (!categoryId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/books?limit=1000&category=${categoryId}`);
      setBooks(res.data.books || []);
    } catch (err) {
      console.error(err);
      message.error("Không tìm thấy sách trong danh mục này");
    }
  };

  const handleSubmit = async (values) => {
    if (!values.categoryId || !values.bookId || !values.quantity || !values.userRole) {
      message.warning("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post("http://localhost:5000/api/imports", {
        bookId: values.bookId,
        quantity: Number(values.quantity),
        userRole: values.userRole,
      });
      message.success("✅ Nhập kho thành công!");
      navigate("/admin/importlist");
    } catch (err) {
      console.error("Lỗi khi nhập kho:", err);
      message.error(err.response?.data?.message || "❌ Lỗi khi nhập kho!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-4">
      <Button
        type="text"
        onClick={() => navigate("/admin/importlist")}
        className="mb-4 flex items-center gap-2"
      >
        <ArrowLeft size={18} /> Quay lại
      </Button>

      <Card className="shadow-xl rounded-2xl">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={8} className="flex flex-col items-center justify-center">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-6 w-full text-center">
              <Title level={4}>📦 Nhập Kho Mới</Title>
              <Text type="secondary">Thêm sách vào kho thư viện</Text>
              <div className="mt-6 w-full">
                <div className="bg-white rounded-lg border-2 border-dashed border-blue-300 p-6 flex flex-col items-center justify-center">
                  <Package size={48} className="text-blue-400 mb-3" />
                  <p className="text-sm text-gray-600">Điền thông tin sách để nhập kho</p>
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
                categoryId: undefined,
                bookId: undefined,
                quantity: 1,
                userRole: undefined,
              }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={24}>
                  <Form.Item
                    name="categoryId"
                    label="Danh mục"
                    rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
                  >
                    <Select
                      placeholder="Chọn danh mục sách"
                      size="large"
                      onChange={handleCategoryChange}
                      loading={loading}
                    >
                      {categories.map((cat) => (
                        <Select.Option key={cat._id} value={cat._id}>
                          {cat.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24}>
                  <Form.Item
                    name="bookId"
                    label="Chọn sách"
                    rules={[{ required: true, message: "Vui lòng chọn sách" }]}
                  >
                    <Select
                      placeholder="Chọn sách cần nhập"
                      size="large"
                      disabled={books.length === 0}
                    >
                      {books.map((book) => (
                        <Select.Option key={book._id} value={book._id}>
                          {book.title}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={12} sm={12}>
                  <Form.Item
                    name="quantity"
                    label="Số lượng nhập"
                    rules={[
                      { required: true, message: "Vui lòng nhập số lượng" },
                      { pattern: /^[1-9]\d*$/, message: "Số lượng phải lớn hơn 0" },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      style={{ width: "100%" }}
                      size="large"
                      placeholder="Nhập số lượng"
                    />
                  </Form.Item>
                </Col>

                <Col xs={12} sm={12}>
                  <Form.Item
                    name="userRole"
                    label="Người nhập kho"
                    rules={[{ required: true, message: "Vui lòng chọn người nhập" }]}
                  >
                    <Select placeholder="Chọn vai trò" size="large">
                      <Select.Option value="admin">Admin</Select.Option>
                      <Select.Option value="librarian">Thủ thư</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} className="flex justify-end gap-3 mt-4">
                  <Button onClick={() => navigate("/admin/importlist")} size="large">
                    Hủy
                  </Button>

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                    size="large"
                  >
                    ✅ Thêm vào kho
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

export default ImportAdd;

