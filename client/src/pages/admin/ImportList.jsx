import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Input, Select, DatePicker, Space, Button, Row, Col, Form } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import locale from "antd/es/date-picker/locale/vi_VN";
import { PackagePlus } from "lucide-react";

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
      const res = await axios.get(`http://localhost:5001/api/imports?page=${page}&limit=${limit}`);
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
      await axios.delete(`http://localhost:5001/api/imports/${id}`);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-2xl text-blue-700 shadow-inner">
              <PackagePlus className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Quản lý Phiếu Nhập Kho</h2>
              <p className="text-sm text-slate-500">Theo dõi lịch sử nhập hàng và người phụ trách</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/admin/importlist/add")}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 text-white px-4 py-2.5 text-sm font-semibold shadow hover:bg-blue-700 transition"
          >
            ➕ Nhập kho mới
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6">
          <Form form={searchForm} onFinish={handleSearch}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12} lg={6}>
                <Form.Item name="searchText" className="mb-0">
                  <Input
                    placeholder="Tên sách hoặc nhà cung cấp"
                    prefix={<SearchOutlined />}
                    allowClear
                    size="large"
                    className="rounded-2xl"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={5}>
                <Form.Item name="quantityRange" className="mb-0">
                  <Select placeholder="Lọc theo số lượng" allowClear size="large" className="rounded-2xl">
                    <Select.Option value="below10">Dưới 10</Select.Option>
                    <Select.Option value="10to50">10 - 50</Select.Option>
                    <Select.Option value="above50">Trên 50</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={5}>
                <Form.Item name="userRole" className="mb-0">
                  <Select placeholder="Người nhập" allowClear size="large" className="rounded-2xl">
                    <Select.Option value="admin">Admin</Select.Option>
                    <Select.Option value="librarian">Thủ thư</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={6}>
                <Form.Item name="dateRange" className="mb-0">
                  <RangePicker
                    locale={locale}
                    format="DD/MM/YYYY"
                    placeholder={["Từ ngày", "Đến ngày"]}
                    className="w-full rounded-2xl"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={2} className="flex items-end">
                <Space size="middle">
                  <Button type="primary" htmlType="submit" className="!rounded-2xl">
                    🔍
                  </Button>
                  <Button
                    className="!rounded-2xl"
                    onClick={() => {
                      searchForm.resetFields();
                      setFilteredImports(imports);
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
                  <th className="p-4 text-center">#</th>
                  <th className="p-4 text-left">Tên sách</th>
                  <th className="p-4 text-center">Số lượng</th>
                  <th className="p-4 text-left">Nhà cung cấp</th>
                  <th className="p-4 text-left">Người nhập</th>
                  <th className="p-4 text-left">Ghi chú</th>
                  <th className="p-4 text-center">Ngày nhập</th>
                  <th className="p-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredImports.map((imp, idx) => {
                  const role = imp.user?.role?.toLowerCase().trim();
                  const roleLabel = role === "admin" ? "Admin" : role ? "Thủ thư" : "Admin";
                  const fullName =
                    imp.user?.fullName && imp.user.fullName !== "Chưa cập nhật"
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
                    <tr key={imp._id} className="hover:bg-blue-50 transition">
                      <td className="p-4 text-center font-semibold text-slate-900">
                        {(page - 1) * limit + idx + 1}
                      </td>
                      <td className="p-4 font-semibold text-slate-900">{imp.book?.title || "Không rõ"}</td>
                      <td className="p-4 text-center text-blue-600 font-bold">{imp.quantity}</td>
                      <td className="p-4">{imp.supplier || "—"}</td>
                      <td className="p-4 text-slate-600">{displayUser}</td>
                      <td className="p-4 text-slate-500 italic max-w-xs">{imp.note || "—"}</td>
                      <td className="p-4 text-center">
                        {new Date(imp.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDelete(imp._id)}
                          className="px-3 py-2 rounded-2xl text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 shadow-sm transition"
                        >
                          🗑️ Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredImports.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-10 text-center text-slate-400">
                      📭 Chưa có phiếu nhập nào.
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

export default ImportList;
