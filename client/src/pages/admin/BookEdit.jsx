import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Card, Form, Input, Select, Row, Col, InputNumber, Upload, Button, Typography, message } from "antd";
import { ArrowLeft } from "lucide-react";

const { Title, Text } = Typography;

const BookEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loadingCode, setLoadingCode] = useState(false);
  const [previewBookCode, setPreviewBookCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const authConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
        
        const [catRes, authorRes, bookRes] = await Promise.all([
          axios.get("http://localhost:5000/api/category?limit=1000&sort=createdAt&order=asc", authConfig),
          axios.get("http://localhost:5000/api/authors?limit=1000", authConfig),
          axios.get(`http://localhost:5000/api/books/${id}`, authConfig),
        ]);

        setCategories(catRes.data.categories || catRes.data);
        setAuthors(authorRes.data.authors || authorRes.data);
        
        const data = bookRes.data;
        form.setFieldsValue({
          title: data.title || "",
          description: data.description || "",
          category: data.category?._id || "",
          author: data.author?._id || "",
          publishedYear: data.publishedYear || "",
          quantity: data.quantity || 0,
          Pricebook: data.Pricebook ?? 50000,
        });
        
        setExistingImages(data.images || []);
        setPreviewBookCode(data.bookCode?.code || "");
        setLoading(false);
      } catch (err) {
        console.error(err);
        message.error("Lỗi tải dữ liệu sách!");
        setLoading(false);
      }
    };
    fetchData();
  }, [id, form]);

  const beforeUpload = (file) => {
    setFileList((prev) => [...prev, file]);
    return false;
  };

  const removeFile = (file) => {
    setFileList((prev) => prev.filter((f) => f.uid !== file.uid && f.name !== file.name));
  };

  const handleCategoryChange = async (categoryId) => {
    if (!categoryId) {
      setPreviewBookCode("");
      return;
    }
    
    setLoadingCode(true);
    try {
      const token = localStorage.getItem("adminToken");
      const authConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      const res = await axios.get(`http://localhost:5000/api/bookcodes/category/${categoryId}`, authConfig);
      
      if (res.data?.prefix) {
        const { prefix, lastNumber = 0 } = res.data;
        const nextCode = `${prefix}-${String((lastNumber || 0) + 1).padStart(3, "0")}`;
        setPreviewBookCode(nextCode);
      }
    } catch (err) {
      console.error(err);
      setPreviewBookCode("⚠️ Lỗi");
    } finally {
      setLoadingCode(false);
    }
  };

  const handleSubmit = async (values) => {
    console.log("Form values:", values);
    console.log("FileList length:", fileList.length);
    console.log("ExistingImages length:", existingImages.length);
    
    if (!values.title || !values.category || !values.publishedYear) {
      message.warning("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (fileList.length === 0 && existingImages.length === 0) {
      message.warning("Vui lòng giữ lại ít nhất một ảnh hoặc thêm ảnh mới");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description || "");
    formData.append("category", values.category);
    formData.append("author", values.author || "");
    formData.append("publishedYear", values.publishedYear);
    formData.append("quantity", values.quantity);
    formData.append("available", values.quantity);
    formData.append("Pricebook", values.Pricebook);

    if (fileList.length > 0) {
      fileList.forEach((f) => formData.append("images", f.originFileObj || f));
    } else if (existingImages.length > 0) {
      formData.append("images", JSON.stringify(existingImages));
    }

    try {
      const token = localStorage.getItem("adminToken");
      const headers = { "Content-Type": "multipart/form-data" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await axios.put(`http://localhost:5000/api/books/${id}`, formData, { headers });
      message.success(res.data.message || "✅ Cập nhật sách thành công!");
      navigate("/admin/bookmanager", { state: { updatedBook: res.data.book } });
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "❌ Cập nhật thất bại!");
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
    <div className="max-w-6xl mx-auto mt-10 p-4">
      <Button
        type="text"
        onClick={() => navigate("/admin/bookmanager")}
        className="mb-4 flex items-center gap-2"
      >
        <ArrowLeft size={18} /> Quay lại
      </Button>

      <Card className="shadow-xl rounded-2xl">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8} className="flex flex-col items-center justify-center">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-6 w-full text-center">
              <Title level={4}>📚 Sửa Sách</Title>
              <Text type="secondary">Cập nhật thông tin sách và ảnh</Text>
              <div className="mt-6 w-full">
                <Upload
                  multiple
                  beforeUpload={beforeUpload}
                  onRemove={removeFile}
                  listType="picture-card"
                  fileList={fileList}
                >
                  <div>
                    <div style={{ marginTop: 8 }}>Tải ảnh</div>
                  </div>
                </Upload>
                <div className="mt-4 text-sm text-gray-500">
                  Hỗ trợ nhiều ảnh. Kéo thả hoặc nhấp để chọn.
                </div>
                {existingImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold mb-2">Ảnh hiện tại:</p>
                    <div className="flex flex-wrap gap-2">
                      {existingImages.map((img, idx) => (
                        <img
                          key={idx}
                          src={img.startsWith("http") ? img : `http://localhost:5000${img}`}
                          alt="book"
                          className="w-16 h-20 object-cover rounded-lg border"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Col>

          <Col xs={24} md={16}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ quantity: 0, Pricebook: 50000 }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={24}>
                  <Form.Item name="title" label="Tên sách" rules={[{ required: true, message: "Nhập tên sách" }]}>
                    <Input size="large" placeholder="Nhập tên sách..." />
                  </Form.Item>
                </Col>

                <Col xs={12} sm={12}>
                  <Form.Item name="category" label="Thể loại" rules={[{ required: true, message: "Chọn thể loại" }]}>
                    <Select
                      placeholder="Chọn thể loại"
                      size="large"
                      onChange={handleCategoryChange}
                    >
                      {categories.map((c) => (
                        <Select.Option key={c._id} value={c._id}>{c.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={12} sm={12}>
                  <Form.Item name="author" label="Tác giả">
                    <Select placeholder="Chọn tác giả" size="large" allowClear>
                      {authors.map((a) => (
                        <Select.Option key={a._id} value={a._id}>{a.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={12} sm={12}>
                  <Form.Item name="publishedYear" label="Năm xuất bản" rules={[{ required: true, message: "Nhập năm xuất bản" }]}>
                    <InputNumber min={1000} max={3000} style={{ width: "100%" }} size="large" />
                  </Form.Item>
                </Col>

                <Col xs={12} sm={12}>
                  <Form.Item label="Mã sách">
                    <Input readOnly value={loadingCode ? "Đang tải..." : previewBookCode} />
                  </Form.Item>
                </Col>

                <Col xs={12} sm={12}>
                  <Form.Item name="quantity" label="Số lượng" rules={[{ required: true, message: "Nhập số lượng" }]}>
                    <InputNumber disabled style={{ width: "100%" }} size="large" />
                  </Form.Item>
                </Col>

                <Col xs={12} sm={12}>
                  <Form.Item name="Pricebook" label="Giá đền bù (VNĐ)" rules={[{ required: true, message: "Nhập giá đền bù" }]}>
                    <InputNumber
                      min={0}
                      formatter={(value) =>
                        value !== undefined && value !== null
                          ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          : ""
                      }
                      parser={(value) => value?.replace(/,/g, "")}
                      style={{ width: "100%" }}
                      size="large"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item name="description" label="Mô tả">
                    <Input.TextArea rows={4} placeholder="Mô tả ngắn về sách" />
                  </Form.Item>
                </Col>

                <Col xs={24} className="flex justify-end gap-3">
                  <Button onClick={() => navigate("/admin/bookmanager")}>Hủy</Button>
                  <Button type="primary" htmlType="submit" loading={submitting}>Cập nhật Sách</Button>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default BookEdit;

