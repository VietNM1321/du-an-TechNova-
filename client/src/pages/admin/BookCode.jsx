import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Input, Select, Space, Button, Row, Col, Form } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const BookCodeManager = () => {
  const [bookCodes, setBookCodes] = useState([]);
  const [filteredBookCodes, setFilteredBookCodes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [searchForm] = Form.useForm();
  const navigate = useNavigate();
  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/categories');
      setCategories(res.data || []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách danh mục:", err);
    }
  };

  const fetchBookCodes = async (pageNum = 1) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/bookcodes?page=${pageNum}&limit=5`);
      const bookCodesData = res.data.bookcodes || [];
      setBookCodes(bookCodesData);
      setFilteredBookCodes(bookCodesData);
      setTotalPages(res.data.pages || 1);
      setPage(res.data.page || 1);
    } catch (err) {
      console.error("Lỗi tải danh sách BookCode:", err);
      setBookCodes([]);
      setFilteredBookCodes([]);
    }
  };

  useEffect(() => {
    fetchBookCodes(page);
    fetchCategories();
  }, [page]);

  const handleSearch = (values) => {
    let filtered = [...bookCodes];
    
    // Tìm theo mã (prefix)
    if (values.searchText) {
      const searchLower = values.searchText.toLowerCase();
      filtered = filtered.filter(code => 
        code.prefix.toLowerCase().includes(searchLower)
      );
    }
    
    // Lọc theo danh mục
    if (values.category) {
      filtered = filtered.filter(code => 
        code.category?._id === values.category
      );
    }
    
    // Lọc theo khoảng số cuối
    if (values.lastNumberRange) {
      switch(values.lastNumberRange) {
        case 'below100':
          filtered = filtered.filter(code => code.lastNumber < 100);
          break;
        case '100to500':
          filtered = filtered.filter(code => code.lastNumber >= 100 && code.lastNumber <= 500);
          break;
        case 'above500':
          filtered = filtered.filter(code => code.lastNumber > 500);
          break;
      }
    }
    
    setFilteredBookCodes(filtered);
  };
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa BookCode này?")) {
      try {
        const res = await axios.delete(`http://localhost:5000/api/bookcodes/${id}`);
        alert(res.data.message || "✅ Xóa thành công!");
        fetchBookCodes(page);
      } catch (err) {
        alert(
          err.response?.data?.message ||
            "❌ Không thể xóa BookCode. Do đang có sách sử dụng!"
        );
      }
    }
  };

  // Phân trang
  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-lg mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-blue-700">📚 Quản lý BookCode</h2>
        <button
          onClick={() => navigate("/admin/bookcode/add")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          ➕ Thêm BookCode
        </button>
      </div>

      <Form
        form={searchForm}
        onFinish={handleSearch}
        className="mb-6"
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="searchText">
              <Input
                placeholder="Tìm kiếm theo mã sách"
                prefix={<SearchOutlined />}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="category">
              <Select placeholder="Lọc theo danh mục" allowClear>
                {categories.map(cat => (
                  <Select.Option key={cat._id} value={cat._id}>
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="lastNumberRange">
              <Select placeholder="Lọc theo số cuối" allowClear>
                <Select.Option value="below100">Dưới 100</Select.Option>
                <Select.Option value="100to500">Từ 100 đến 500</Select.Option>
                <Select.Option value="above500">Trên 500</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Space>
              <Button type="primary" htmlType="submit">
                🔍 Tìm kiếm
              </Button>
              <Button onClick={() => {
                searchForm.resetFields();
                setFilteredBookCodes(bookCodes);
              }}>
                ↺ Đặt lại
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>

      <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-blue-100 text-blue-800">
          <tr>
            <th className="p-3 border text-left">Category</th>
            <th className="p-3 border text-left">Code</th>
            <th className="p-3 border text-left">Last Number</th>
            <th className="p-3 border text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredBookCodes.map((b) => (
            <tr key={b._id} className="hover:bg-gray-50 h-16 align-middle">
              <td className="p-3 border">{b.category?.name || "—"}</td>
              <td className="p-3 border font-mono">{b.prefix}</td>
              <td className="p-3 border">{b.lastNumber}</td>
              <td className="p-3 border text-center">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => navigate(`/admin/bookcode/edit/${b._id}`)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(b._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {filteredBookCodes.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center py-6 text-gray-500 italic">
                📭 Chưa có BookCode nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex justify-center mt-6 space-x-4">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className={`px-4 py-2 rounded-lg border ${
            page === 1
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
              : "text-blue-600 border-blue-400 hover:bg-blue-100"
          }`}
        >
          ◀ Trước
        </button>
        <span className="px-4 py-2 text-gray-700 font-semibold">
          Trang {page}/{totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={page === totalPages}
          className={`px-4 py-2 rounded-lg border ${
            page === totalPages
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
              : "text-blue-600 border-blue-400 hover:bg-blue-100"
          }`}
        >
          Sau ▶
        </button>
      </div>
    </div>
  );
};

export default BookCodeManager;
