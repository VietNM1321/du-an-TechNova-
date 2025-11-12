import React, { useEffect, useState } from "react";
import { Table, Button, message, Space, Image, Input, Select, DatePicker, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDateRange, setFilterDateRange] = useState([null, null]);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/notifications");
      setNotifications(res.data);
      setFilteredNotifications(res.data);
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi tải danh sách thông báo!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa thông báo này?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${id}`);
      message.success("Xóa thông báo thành công!");
      fetchNotifications();
    } catch (err) {
      console.error(err);
      message.error("Xóa thông báo thất bại!");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Hàm lọc thông báo
  useEffect(() => {
    let result = notifications;

    // Lọc theo text tìm kiếm (tiêu đề, nội dung)
    if (searchText.trim()) {
      result = result.filter(notif =>
        notif.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        notif.message?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Lọc theo loại thông báo
    if (filterType) {
      result = result.filter(notif => notif.type === filterType);
    }

    // Lọc theo khoảng thời gian
    if (filterDateRange[0] && filterDateRange[1]) {
      const startDate = filterDateRange[0].startOf('day');
      const endDate = filterDateRange[1].endOf('day');
      result = result.filter(notif => {
        const notifDate = dayjs(notif.createdAt);
        return notifDate.isAfter(startDate) && notifDate.isBefore(endDate);
      });
    }

    setFilteredNotifications(result);
  }, [searchText, filterType, filterDateRange, notifications]);

  // Hàm reset bộ lọc
  const handleResetFilters = () => {
    setSearchText("");
    setFilterType("");
    setFilterDateRange([null, null]);
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <span
          className="cursor-pointer text-blue-600 hover:underline"
          onClick={() => navigate(`/admin/notifications/edit/${record._id}`)}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        const typeMap = {
          general: { label: "Chung", color: "#1890ff" },
          reminder: { label: "Nhắc nhở", color: "#fa8c16" },
          review: { label: "Đánh giá", color: "#52c41a" },
          borrow: { label: "Mượn", color: "#1890ff" },
          return: { label: "Trả", color: "#722ed1" },
          system: { label: "Hệ thống", color: "#eb2f96" },
        };
        const info = typeMap[type] || { label: type, color: "#666" };
        return (
          <span style={{ color: info.color, fontWeight: "bold" }}>
            {info.label}
          </span>
        );
      },
    },
    {
      title: "Nội dung",
      dataIndex: "message",
      key: "message",
      render: (text) => (
        <span title={text}>
          {text.length > 50 ? text.substring(0, 50) + "..." : text}
        </span>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: date => new Date(date).toLocaleString("vi-VN"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Ảnh minh họa",
      dataIndex: ["data","image"],
      key: "image",
      render: img => img ? <Image src={`http://localhost:5000/${img}`} width={80} /> : "-"
    },
    {
      title: "File Word",
      dataIndex: ["data","wordFile"],
      key: "wordFile",
      render: file => file ? <a href={`http://localhost:5000/${file}`} target="_blank" rel="noreferrer">Tải Word</a> : "-"
    },
    {
      title: "File Excel",
      dataIndex: ["data","excelFile"],
      key: "excelFile",
      render: file => file ? <a href={`http://localhost:5000/${file}`} target="_blank" rel="noreferrer">Tải Excel</a> : "-"
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => navigate(`/admin/notifications/edit/${record._id}`)}>Sửa</Button>
          <Button type="link" danger onClick={() => handleDelete(record._id)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">📄 Danh sách thông báo</h2>
      
      {/* Phần nút thêm */}
      <div className="mb-6">
        <Button type="primary" size="large" onClick={() => navigate("/admin/notifications/add")}>
          ➕ Thêm thông báo
        </Button>
      </div>

      {/* Bộ lọc và tìm kiếm */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <Row gutter={[16, 16]}>
          {/* Tìm kiếm theo tiêu đề/nội dung */}
          <Col xs={24} sm={12} md={8}>
            <label className="block text-sm font-medium mb-2">Tìm kiếm</label>
            <Input
              placeholder="Tìm theo tiêu đề hoặc nội dung..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              size="large"
            />
          </Col>

          {/* Lọc theo loại thông báo */}
          <Col xs={24} sm={12} md={8}>
            <label className="block text-sm font-medium mb-2">Loại thông báo</label>
            <Select
              placeholder="Chọn loại..."
              value={filterType || undefined}
              onChange={(value) => setFilterType(value || "")}
              allowClear
              size="large"
              options={[
                { label: "Chung", value: "general" },
                { label: "Nhắc nhở", value: "reminder" },
                { label: "Đánh giá", value: "review" },
                { label: "Mượn", value: "borrow" },
                { label: "Trả", value: "return" },
                { label: "Hệ thống", value: "system" },
              ]}
            />
          </Col>

          {/* Lọc theo khoảng thời gian */}
          <Col xs={24} sm={12} md={8}>
            <label className="block text-sm font-medium mb-2">Khoảng thời gian</label>
            <DatePicker.RangePicker
              value={filterDateRange[0] && filterDateRange[1] ? filterDateRange : [null, null]}
              onChange={(dates) => setFilterDateRange(dates || [null, null])}
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              size="large"
            />
          </Col>

          {/* Nút reset */}
          <Col xs={24} sm={12} md={24} lg={24}>
            <Button
              onClick={handleResetFilters}
              style={{ marginTop: "24px" }}
              size="large"
            >
              🔄 Đặt lại
            </Button>
          </Col>
        </Row>
      </div>

      {/* Thông tin kết quả */}
      <div className="mb-4 text-sm text-gray-600">
        Tìm thấy <strong>{filteredNotifications.length}</strong> thông báo
      </div>

      {/* Bảng danh sách */}
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={filteredNotifications}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default NotificationList;
