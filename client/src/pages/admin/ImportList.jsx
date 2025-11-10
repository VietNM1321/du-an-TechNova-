import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Input, Select, DatePicker, Space, Button, Row, Col, Form } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import locale from "antd/es/date-picker/locale/vi_VN";

const { RangePicker } = DatePicker;

const ImportList = () => {
  const [imports, setImports] = useState([]);
  const [filteredImports, setFilteredImports] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [searchForm] = Form.useForm();
  const navigate = useNavigate();
  const fetchImports = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/imports?page=${page}&limit=${limit}`);
      const data = res.data;
      const importData = data.imports || data;
      setImports(importData);
      setFilteredImports(importData);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Lỗi tải danh sách nhập kho:", err);
    }
  };

  const handleSearch = (values) => {
    let filtered = [...imports];
    
    // Tìm kiếm theo tên sách hoặc nhà cung cấp
    if (values.searchText) {
      const searchLower = values.searchText.toLowerCase();
      filtered = filtered.filter(imp => 
        (imp.book?.title?.toLowerCase().includes(searchLower) ||
        imp.supplier?.toLowerCase().includes(searchLower))
      );
    }

    // Lọc theo khoảng số lượng
    if (values.quantityRange) {
      switch(values.quantityRange) {
        case 'below10':
          filtered = filtered.filter(imp => imp.quantity < 10);
          break;
        case '10to50':
          filtered = filtered.filter(imp => imp.quantity >= 10 && imp.quantity <= 50);
          break;
        case 'above50':
          filtered = filtered.filter(imp => imp.quantity > 50);
          break;
      }
    }

    // Lọc theo người nhập
    if (values.userRole) {
      filtered = filtered.filter(imp => {
        const role = imp.user?.role?.toLowerCase().trim();
        if (values.userRole === 'admin') return role === 'admin';
        if (values.userRole === 'librarian') return role !== 'admin';
        return true;
      });
    }

    // Lọc theo khoảng thời gian
    if (values.dateRange) {
      const [startDate, endDate] = values.dateRange;
      filtered = filtered.filter(imp => {
        const importDate = new Date(imp.createdAt);
        return importDate >= startDate && importDate <= endDate;
      });
    }

    setFilteredImports(filtered);
  };

  useEffect(() => {
    fetchImports();
  }, [page]);
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa phiếu nhập này không?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/imports/${id}`);
      alert("🗑️ Xóa phiếu nhập thành công!");
      fetchImports();
    } catch (err) {
      console.error("Lỗi xóa phiếu nhập:", err);
      alert("❌ Xóa thất bại!");
    }
  };
  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };
  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-lg mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-blue-700">📦 Quản lý Phiếu Nhập Kho</h2>
        <button
          onClick={() => navigate("/admin/importlist/add")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1"
        >
          ➕ Nhập Kho Mới
        </button>
      </div>

      <Form
        form={searchForm}
        onFinish={handleSearch}
        className="mb-6"
      >
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item name="searchText">
              <Input
                placeholder="Tìm theo tên sách/nhà cung cấp"
                prefix={<SearchOutlined />}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item name="quantityRange">
              <Select placeholder="Lọc theo số lượng" allowClear>
                <Select.Option value="below10">Dưới 10</Select.Option>
                <Select.Option value="10to50">Từ 10 đến 50</Select.Option>
                <Select.Option value="above50">Trên 50</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item name="userRole">
              <Select placeholder="Lọc theo người nhập" allowClear>
                <Select.Option value="admin">Admin</Select.Option>
                <Select.Option value="librarian">Thủ thư</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item name="dateRange">
              <RangePicker 
                locale={locale}
                format="DD/MM/YYYY"
                placeholder={["Từ ngày", "Đến ngày"]}
              />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Space>
              <Button type="primary" htmlType="submit">
                🔍 Tìm
              </Button>
              <Button onClick={() => {
                searchForm.resetFields();
                setFilteredImports(imports);
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
          <th className="p-3 border text-center">#</th>
          <th className="p-3 border text-left">Tên sách</th>
          <th className="p-3 border text-center">Số lượng</th>
          <th className="p-3 border text-left">Nhà cung cấp</th>
          <th className="p-3 border text-left">Người nhập</th>
          <th className="p-3 border text-left">Ghi chú</th>
          <th className="p-3 border text-center">Ngày nhập</th>
          <th className="p-3 border text-center">Hành động</th>
        </tr>
      </thead>
      <tbody>
        {filteredImports.map((imp, idx) => {
          const role = imp.user?.role?.toLowerCase().trim();
          const roleLabel = role === "admin" ? "Admin" : role ? "Thủ thư" : "Admin";
          const fullName = imp.user?.fullName && imp.user.fullName !== "Chưa cập nhật"
            ? imp.user.fullName
            : null;
          const displayUser = imp.userLabel
            ? imp.userLabel
            : imp.user
            ? fullName
              ? `${fullName} (${roleLabel})`
              : roleLabel
            : roleLabel;
          return (
            <tr key={imp._id} className="hover:bg-gray-50 h-16 transition-all">
            <td className="p-3 border text-center">{(page - 1) * limit + idx + 1}</td>
            <td className="p-3 border font-semibold">{imp.book?.title || "Không rõ"}</td>
            <td className="p-3 border text-center text-blue-700 font-bold">{imp.quantity}</td>
            <td className="p-3 border">{imp.supplier || "-"}</td>
            <td className="p-3 border text-gray-700">{displayUser}</td>
            <td className="p-3 border text-gray-600 italic max-w-xs truncate">{imp.note || "-"}</td>
            <td className="p-3 border text-center">
              {new Date(imp.createdAt).toLocaleDateString("vi-VN")}
            </td>
            <td className="p-3 border text-center">
              <button
                onClick={() => handleDelete(imp._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                🗑️ Xóa
              </button>
            </td>
          </tr>
          );
        })}
        {filteredImports.length === 0 && (
          <tr>
            <td colSpan="7" className="text-center py-6 text-gray-500 italic">
              📭 Chưa có phiếu nhập nào.
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

export default ImportList;
