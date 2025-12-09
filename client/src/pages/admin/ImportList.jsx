import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Input, Select, DatePicker, Space, Button, Row, Col, Form, Table, Tag, Modal, message, Tooltip } from "antd";
import { SearchOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import locale from "antd/es/date-picker/locale/vi_VN";
import { PackagePlus } from "lucide-react";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const ImportList = () => {
  const [imports, setImports] = useState([]);
  const [groupedImports, setGroupedImports] = useState([]);
  const [filteredGrouped, setFilteredGrouped] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchForm] = Form.useForm();
  const navigate = useNavigate();

  const fetchImports = async () => {
    try {
      setLoading(true);
      // Lấy tất cả imports (không phân trang, sau đó xử lý ở frontend)
      const res = await axios.get(`http://localhost:5000/api/imports?limit=10000`);
      const data = res.data;
      const importData = data.imports || data;
      
      // Gom các phiếu nhập cùng ngày thành 1 "đơn lớn"
      const groupsMap = new Map();
      
      importData.forEach((imp) => {
        const importDate = imp.importDate ? dayjs(imp.importDate).format("YYYY-MM-DD") : dayjs(imp.createdAt).format("YYYY-MM-DD");
        
        if (!groupsMap.has(importDate)) {
          groupsMap.set(importDate, {
            key: importDate,
            importDate: imp.importDate || imp.createdAt,
            items: [],
          });
        }
        const group = groupsMap.get(importDate);
        group.items.push(imp);
      });
      
      const groups = Array.from(groupsMap.values()).map((g) => {
        const totalQuantity = g.items.reduce((sum, it) => sum + (it.quantity || 0), 0);
        const totalBooks = g.items.length;
        
        return {
          ...g,
          totalQuantity,
          totalBooks,
        };
      });
      
      // Sắp xếp theo ngày nhập mới nhất
      groups.sort((a, b) => new Date(b.importDate) - new Date(a.importDate));
      
      setImports(importData);
      setGroupedImports(groups);
      setFilteredGrouped(groups);
    } catch (err) {
      console.error("Lỗi tải danh sách nhập kho:", err);
      message.error("Không thể tải danh sách nhập kho!");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (values) => {
    let filtered = [...groupedImports];
    
    // Lọc theo ngày
    if (values.dateRange) {
      const [startDate, endDate] = values.dateRange;
      filtered = filtered.filter(group => {
        const groupDate = new Date(group.importDate);
        return groupDate >= startDate && groupDate <= endDate;
      });
    }
    
    // Tìm kiếm theo tên sách hoặc nhà cung cấp trong các item của group
    if (values.searchText) {
      const searchLower = values.searchText.toLowerCase();
      filtered = filtered.map(group => ({
        ...group,
        items: group.items.filter(imp => 
          imp.book?.title?.toLowerCase().includes(searchLower) ||
          imp.supplier?.toLowerCase().includes(searchLower)
        ),
      })).filter(group => group.items.length > 0);
    }

    // Lọc theo khoảng số lượng
    if (values.quantityRange) {
      filtered = filtered.map(group => ({
        ...group,
        items: group.items.filter(imp => {
          switch(values.quantityRange) {
            case 'below10':
              return imp.quantity < 10;
            case '10to50':
              return imp.quantity >= 10 && imp.quantity <= 50;
            case 'above50':
              return imp.quantity > 50;
            default:
              return true;
          }
        }),
      })).filter(group => group.items.length > 0);
    }

    // Lọc theo người nhập
    if (values.userRole) {
      filtered = filtered.map(group => ({
        ...group,
        items: group.items.filter(imp => {
          const role = imp.user?.role?.toLowerCase().trim();
          if (values.userRole === 'admin') return role === 'admin';
          if (values.userRole === 'librarian') return role !== 'admin';
          return true;
        }),
      })).filter(group => group.items.length > 0);
    }

    // Cập nhật totalQuantity và totalBooks sau khi filter
    const updatedFiltered = filtered.map(group => ({
      ...group,
      totalQuantity: group.items.reduce((sum, it) => sum + (it.quantity || 0), 0),
      totalBooks: group.items.length,
    }));

    setFilteredGrouped(updatedFiltered);
  };

  useEffect(() => {
    fetchImports();
  }, []);
  // Cột cho bảng "đơn lớn" (đã gộp theo ngày)
  const groupedColumns = [
    {
      title: "Ngày nhập",
      dataIndex: "importDate",
      key: "importDate",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "—"),
    },
    {
      title: "Số loại sách",
      dataIndex: "totalBooks",
      key: "totalBooks",
      render: (total) => (
        <span className="font-semibold text-blue-600">
          {total} loại
        </span>
      ),
    },
    {
      title: "Tổng số lượng",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      render: (total) => (
        <span className="font-semibold text-green-600">
          {total} quyển
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() =>
              navigate(`/admin/importlist/${encodeURIComponent(record.key)}`, {
                state: { group: record },
              })
            }
          >
            Xem chi tiết
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleDeleteGroup(record.key, record.items)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const handleDeleteGroup = (importDate, items) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc muốn xóa tất cả ${items.length} phiếu nhập của ngày ${dayjs(importDate).format("DD/MM/YYYY")} không?`,
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      async onOk() {
        try {
          // Xóa từng phiếu trong group
          await Promise.all(
            items.map(item => axios.delete(`http://localhost:5000/api/imports/${item._id}`))
          );
          message.success("✅ Xóa thành công!");
          fetchImports();
        } catch (err) {
          console.error("Lỗi xóa:", err);
          message.error("❌ Xóa thất bại!");
        }
      },
    });
  };

  return (
    <div style={{ padding: "0 40px 24px" }}>
      <div style={{ marginBottom: 16 }}>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            margin: 0,
            color: "#1677ff",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span role="img" aria-label="warehouse">📦</span>
          <span>Quản lý Phiếu Nhập Kho</span>
        </h2>
     
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          border: "1px solid #f0f0f0",
        }}
      >
        <Form form={searchForm} onFinish={handleSearch}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} lg={6}>
              <Form.Item name="searchText" className="mb-0">
                <Input
                  placeholder="Tên sách hoặc nhà cung cấp"
                  prefix={<SearchOutlined />}
                  allowClear
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={5}>
              <Form.Item name="quantityRange" className="mb-0">
                <Select placeholder="Lọc theo số lượng" allowClear size="large">
                  <Select.Option value="below10">Dưới 10</Select.Option>
                  <Select.Option value="10to50">10 - 50</Select.Option>
                  <Select.Option value="above50">Trên 50</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={5}>
              <Form.Item name="userRole" className="mb-0">
                <Select placeholder="Người nhập" allowClear size="large">
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
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={2}>
              <Space size="middle">
                <Button type="primary" htmlType="submit">
                  🔍
                </Button>
                <Button
                  onClick={() => {
                    searchForm.resetFields();
                    setFilteredGrouped(groupedImports);
                  }}
                >
                  ↺
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          onClick={() => navigate("/admin/importlist/add")}
          style={{ marginBottom: 16 }}
        >
          ➕ Nhập kho mới
        </Button>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          border: "1px solid #f0f0f0",
        }}
      >
        <Table
          rowKey={(r) => r.key}
          columns={groupedColumns}
          dataSource={filteredGrouped}
          loading={loading}
          pagination={{ pageSize: 10 }}
          bordered
        />
      </div>
    </div>
  );
};

export default ImportList;

