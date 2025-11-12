import React, { useEffect, useState } from "react";
import axios from "axios";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Select,
  Row,
  Col,
  InputNumber,
  Upload,
  Button,
  Typography,
  message,
} from "antd";

const { Title, Text } = Typography;

const BookAdd = () => {
  const navigate = useNavigate();
  const [previewBookCode, setPreviewBookCode] = useState("");
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [loadingCode, setLoadingCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Lấy danh mục và tác giả
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, authorRes] = await Promise.all([
          axios.get("http://localhost:5000/api/category?limit=1000&sort=createdAt&order=asc"),
          axios.get("http://localhost:5000/api/authors?limit=1000"),
        ]);
        setCategories(catRes.data.categories || catRes.data);
        setAuthors(authorRes.data.authors || authorRes.data);
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      }
    };
    fetchData();
  }, []);
  // preview code will be fetched when category changes via Select onChange
  const beforeUpload = (file) => {
    // prevent auto upload; store files in state
    setFileList((prev) => [...prev, file]);
    return false;
  };

  const removeFile = (file) => {
    setFileList((prev) => prev.filter((f) => f.uid !== file.uid && f.name !== file.name));
  };

  const handleSubmit = async (values) => {
    if (!values.title || !values.category || !values.publishedYear || !values.quantity) {
      message.warning("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    if (fileList.length === 0) {
      message.warning("Vui lòng thêm ít nhất một ảnh sách");
      return;
    }

    setSubmitting(true);
    const dataToSend = {
      title: values.title,
      description: values.description || "",
      category: values.category,
      author: values.author || "",
      publishedYear: values.publishedYear,
      quantity: values.quantity,
      available: values.quantity,
    };

    const formData = new FormData();
    Object.entries(dataToSend).forEach(([k, v]) => formData.append(k, v));
    fileList.forEach((f) => formData.append("images", f.originFileObj || f));

    try {
      const token = localStorage.getItem("adminToken");
      await axios.post("http://localhost:5000/api/books", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      message.success("✅ Thêm sách thành công!");
      navigate("/admin/bookmanager");
    } catch (err) {
      console.error("Lỗi thêm sách:", err.response?.data || err);
      message.error(err.response?.data?.message || "❌ Thêm sách thất bại!");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
      <Card className="shadow-xl rounded-2xl">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8} className="flex flex-col items-center justify-center">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-6 w-full text-center">
              <Title level={4}>📚 Thêm Sách Mới</Title>
              <Text type="secondary">Thêm thông tin cơ bản cho sách và upload ảnh</Text>

              <div className="mt-6 w-full">
                <Upload
                  multiple
                  beforeUpload={beforeUpload}
                  onRemove={removeFile}
                  listType="picture-card"
                  fileList={fileList}
                >
                  <div>
                    <PlusCircle size={20} />
                    <div style={{ marginTop: 8 }}>Tải ảnh</div>
                  </div>
                </Upload>

                <div className="mt-4 text-sm text-gray-500">
                  Hỗ trợ nhiều ảnh. Kéo thả hoặc nhấp để chọn.
                </div>
              </div>
            </div>
          </Col>

          <Col xs={24} md={16}>
            <Form layout="vertical" onFinish={handleSubmit} initialValues={{ quantity: 1 }}>
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
                      onChange={(val) => {
                        if (val) {
                          setLoadingCode(true);
                          axios.get(`http://localhost:5000/api/bookcodes/category/${val}`)
                            .then(res => {
                              if (res.data) {
                                const { prefix, lastNumber } = res.data;
                                setPreviewBookCode(`${prefix}-${String(lastNumber + 1).padStart(3, "0")}`);
                              }
                            })
                            .catch(err => {
                              console.error(err);
                              setPreviewBookCode("Mã sách chưa tồn tại");
                            })
                            .finally(() => setLoadingCode(false));
                        } else {
                          setPreviewBookCode("");
                        }
                      }}
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
                    <InputNumber min={1} style={{ width: "100%" }} size="large" />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item name="description" label="Mô tả">
                    <Input.TextArea rows={4} placeholder="Mô tả ngắn về sách" />
                  </Form.Item>
                </Col>

                <Col xs={24} className="flex justify-end gap-3">
                  <Button onClick={() => navigate("/admin/bookmanager")}>Hủy</Button>
                  <Button onClick={() => { setFileList([]); message.info("Đã reset ảnh"); }}>Reset ảnh</Button>
                  <Button type="primary" htmlType="submit" icon={<PlusCircle size={16} />} loading={submitting}>Thêm Sách</Button>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default BookAdd;
