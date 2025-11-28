import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Input, Select, Space, Button, Row, Col, Form } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { Barcode } from "lucide-react";
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
      const res = await axios.get('http://localhost:5001/api/categories');
      setCategories(res.data || []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách danh mục:", err);
    }
  };
  const fetchBookCodes = async (pageNum = 1) => {
    try {
      const res = await axios.get(`http://localhost:5001/api/bookcodes?page=${pageNum}&limit=5`);
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
    if (values.searchText) {
      const searchLower = values.searchText.toLowerCase();
      filtered = filtered.filter(code => 
        code.prefix.toLowerCase().includes(searchLower)
      );
    }
    if (values.category) {
      filtered = filtered.filter(code => 
        code.category?._id === values.category
      );
    }
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
        const res = await axios.delete(`http://localhost:5001/api/bookcodes/${id}`);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-2xl text-blue-700 shadow-inner">
              <Barcode className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Quản lý BookCode</h2>
              <p className="text-sm text-slate-500">Theo dõi mã sách tự động cho từng danh mục</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/admin/bookcode/add")}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 text-white px-4 py-2.5 text-sm font-semibold shadow hover:bg-blue-700 transition"
          >
            ➕ Thêm BookCode
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6">
          <Form form={searchForm} onFinish={handleSearch}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12} lg={8}>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tìm kiếm</label>
                <Form.Item name="searchText" className="mt-2 mb-0">
                  <Input placeholder="Tìm theo mã sách" prefix={<SearchOutlined />} allowClear size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Danh mục</label>
                <Form.Item name="category" className="mt-2 mb-0">
                  <Select placeholder="Lọc theo danh mục" allowClear size="large">
                    {categories.map((cat) => (
                      <Select.Option key={cat._id} value={cat._id}>
                        {cat.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={6}>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Khoảng số cuối</label>
                <Form.Item name="lastNumberRange" className="mt-2 mb-0">
                  <Select placeholder="Chọn khoảng" allowClear size="large">
                    <Select.Option value="below100">Dưới 100</Select.Option>
                    <Select.Option value="100to500">Từ 100 - 500</Select.Option>
                    <Select.Option value="above500">Trên 500</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={2} className="flex items-end">
                <Space>
                  <Button type="primary" htmlType="submit" className="!rounded-2xl">
                    🔍
                  </Button>
                  <Button
                    className="!rounded-2xl"
                    onClick={() => {
                      searchForm.resetFields();
                      setFilteredBookCodes(bookCodes);
                    }}
                  >
                    ↺
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 uppercase text-xs tracking-wide">
                <tr>
                  <th className="p-4 text-left">Danh mục</th>
                  <th className="p-4 text-left">Mã</th>
                  <th className="p-4 text-left">Số cuối</th>
                  <th className="p-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredBookCodes.map((b) => (
                  <tr key={b._id} className="hover:bg-blue-50 transition">
                    <td className="p-4 font-semibold text-slate-900">{b.category?.name || "—"}</td>
                    <td className="p-4 font-mono">{b.prefix}</td>
                    <td className="p-4">{b.lastNumber}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/bookcode/edit/${b._id}`)}
                          className="px-3 py-2 rounded-2xl text-xs font-semibold text-slate-700 bg-yellow-100 hover:bg-yellow-200 transition"
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(b._id)}
                          className="px-3 py-2 rounded-2xl text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 shadow-sm transition"
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredBookCodes.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400 text-sm">
                      📭 Chưa có BookCode nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={handlePrev}
            disabled={page === 1}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold ${
              page === 1
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            } transition`}
          >
            ◀ Trước
          </button>
          <span className="text-sm font-semibold text-slate-600">
            Trang {page}/{totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold ${
              page === totalPages
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            } transition`}
          >
            Sau ▶
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCodeManager;
