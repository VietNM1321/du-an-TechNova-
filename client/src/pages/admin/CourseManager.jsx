import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  message,
  Popconfirm,
  Row,
  Col,
  Select,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { GraduationCap } from "lucide-react";
const CourseManager = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchForm] = Form.useForm();
  const [form] = Form.useForm();
  const [filteredCourses, setFilteredCourses] = useState([]);

  const API_URL = "http://localhost:5001/api/courses";
  
  const handleSearch = (values) => {
    let filtered = [...courses];
    
    if (values.searchText) {
      const searchLower = values.searchText.toLowerCase();
      filtered = filtered.filter(
        course => 
          course.courseName.toLowerCase().includes(searchLower) ||
          course.courseCode.toLowerCase().includes(searchLower)
      );
    }
    
    if (values.studentCodeRange) {
      if (values.studentCodeRange === 'below2000') {
        filtered = filtered.filter(course => course.maxStudentCode < 2000);
      } else if (values.studentCodeRange === '2000to4000') {
        filtered = filtered.filter(course => course.minStudentCode >= 2000 && course.maxStudentCode <= 4000);
      } else if (values.studentCodeRange === 'above4000') {
        filtered = filtered.filter(course => course.minStudentCode > 4000);
      }
    }
    
    setFilteredCourses(filtered);
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setCourses(res.data);
      setFilteredCourses(res.data);
    } catch (err) {
      message.error("Lỗi khi tải danh sách khóa học!");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCourses();
  }, []);
  const openModal = (course = null) => {
    setEditingCourse(course);
    if (course) form.setFieldsValue(course);
    else form.resetFields();
    setIsModalOpen(true);
  };
  const handleSubmit = async (values) => {
    try {
      if (editingCourse) {
        await axios.put(`${API_URL}/${editingCourse._id}`, values);
        message.success("✅ Cập nhật khóa học thành công!");
      } else {
        await axios.post(API_URL, values);
        message.success("✅ Thêm khóa học thành công!");
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi khi lưu khóa học!");
    }
  };
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      message.success("🗑️ Đã xóa khóa học!");
      fetchCourses();
    } catch {
      message.error("Lỗi khi xóa khóa học!");
    }
  };
  const columns = [
    {
      title: "Tên khóa học",
      dataIndex: "courseName",
      key: "courseName",
    },
    {
      title: "Mã khóa học",
      dataIndex: "courseCode",
      key: "courseCode",
    },
    {
      title: "Mã SV nhỏ nhất",
      dataIndex: "minStudentCode",
      key: "minStudentCode",
      render: (value) => `PH${String(value).padStart(4, "0")}`,
    },
    {
      title: "Mã SV lớn nhất",
      dataIndex: "maxStudentCode",
      key: "maxStudentCode",
      render: (value) => `PH${String(value).padStart(4, "0")}`,
    },
    {
      title: "Hành động",
      render: (record) => (
        <Space>
          <Button type="link" onClick={() => openModal(record)}>
            ✏️ Sửa
          </Button>
          <Popconfirm
            title="Xóa khóa học này?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button type="link" danger>
              🗑️ Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-2xl text-blue-700 shadow-inner">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Quản lý khóa học</h2>
              <p className="text-sm text-slate-500">Cập nhật thông tin khóa và mã sinh viên liên quan</p>
            </div>
          </div>
          <Button
            type="primary"
            onClick={() => openModal()}
            className="!rounded-2xl !bg-blue-600 hover:!bg-blue-700 !border-none !px-5 !py-2.5 !text-sm"
          >
            ➕ Thêm khóa học
          </Button>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6">
          <Form form={searchForm} onFinish={handleSearch}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12} lg={8}>
                <Form.Item name="searchText" className="mb-0">
                  <Input
                    placeholder="Tìm theo tên hoặc mã khóa học"
                    prefix={<SearchOutlined />}
                    allowClear
                    size="large"
                    className="rounded-2xl"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item name="studentCodeRange" className="mb-0">
                  <Select placeholder="Lọc theo mã sinh viên" allowClear size="large" className="rounded-2xl">
                    <Select.Option value="below2000">Dưới PH2000</Select.Option>
                    <Select.Option value="2000to4000">PH2000 - PH4000</Select.Option>
                    <Select.Option value="above4000">Trên PH4000</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Space size="middle">
                  <Button type="primary" htmlType="submit" className="!rounded-2xl">
                    🔍 Tìm kiếm
                  </Button>
                  <Button
                    className="!rounded-2xl"
                    onClick={() => {
                      searchForm.resetFields();
                      setFilteredCourses(courses);
                    }}
                  >
                    ↺ Đặt lại
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-slate-100">
          <Table
            rowKey="_id"
            dataSource={filteredCourses}
            columns={columns}
            loading={loading}
            pagination={false}
          />
        </div>
      </div>
      <Modal
        open={isModalOpen}
        title={editingCourse ? "Chỉnh sửa khóa học" : "Thêm khóa học mới"}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Tên khóa học"
            name="courseName"
            rules={[{ required: true, message: "Vui lòng nhập tên khóa học!" }]}
          >
            <Input placeholder="VD: Khóa 18 - Lập trình Web" />
          </Form.Item>

          <Form.Item
            label="Mã khóa học"
            name="courseCode"
            rules={[{ required: true, message: "Vui lòng nhập mã khóa học!" }]}
          >
            <Input placeholder="VD: K18WEB" />
          </Form.Item>

          <Form.Item
            label="Mã sinh viên nhỏ nhất"
            name="minStudentCode"
            rules={[{ required: true, message: "Nhập mã sinh viên nhỏ nhất!" }]}
          >
            <InputNumber
              min={1}
              max={9999}
              style={{ width: "100%" }}
              placeholder="VD: 1 (tương ứng PH0001)"
            />
          </Form.Item>

          <Form.Item
            label="Mã sinh viên lớn nhất"
            name="maxStudentCode"
            rules={[{ required: true, message: "Nhập mã sinh viên lớn nhất!" }]}
          >
            <InputNumber
              min={1}
              max={9999}
              style={{ width: "100%" }}
              placeholder="VD: 1000 (tương ứng PH1000)"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseManager;
