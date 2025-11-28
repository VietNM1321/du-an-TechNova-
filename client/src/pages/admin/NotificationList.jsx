import React, { useEffect, useState } from "react";
import { Table, Button, message, Space, Image, Input, Select, DatePicker, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import { Bell } from "lucide-react";

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
      const res = await axios.get("http://localhost:5001/api/notifications");
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
      await axios.delete(`http://localhost:5001/api/notifications/${id}`);
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
      render: img => img ? <Image src={`http://localhost:5001/${img}`} width={80} /> : "-"
    },
    {
      title: "File Word",
      dataIndex: ["data","wordFile"],
      key: "wordFile",
      render: file => file ? <a href={`http://localhost:5001/${file}`} target="_blank" rel="noreferrer">Tải Word</a> : "-"
    },
    {
      title: "File Excel",
      dataIndex: ["data","excelFile"],
      key: "excelFile",
      render: file => file ? <a href={`http://localhost:5001/${file}`} target="_blank" rel="noreferrer">Tải Excel</a> : "-"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-2xl text-blue-700 shadow-inner">
              <Bell className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Quản lý thông báo</h2>
              <p className="text-sm text-slate-500">
                Giám sát các thông báo gửi đến người dùng và bộ lọc theo nhu cầu
              </p>
            </div>
          </div>
          <Button
            type="primary"
            size="large"
            className="!rounded-2xl !bg-blue-600 hover:!bg-blue-700 !border-none !px-5 !py-2.5 !text-sm"
            onClick={() => navigate("/admin/notifications/add")}
          >
            ➕ Thêm thông báo
          </Button>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} lg={8}>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tìm kiếm</label>
              <Input
                placeholder="Tìm theo tiêu đề hoặc nội dung..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                size="large"
                className="mt-2 rounded-2xl border-slate-200"
              />
            </Col>
            <Col xs={24} md={12} lg={8}>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Loại thông báo</label>
              <Select
                className="mt-2 w-full"
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
            <Col xs={24} md={12} lg={8}>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Khoảng thời gian</label>
              <DatePicker.RangePicker
                value={filterDateRange[0] && filterDateRange[1] ? filterDateRange : [null, null]}
                onChange={(dates) => setFilterDateRange(dates || [null, null])}
                format="DD/MM/YYYY"
                className="mt-2 w-full rounded-2xl"
                size="large"
              />
            </Col>
            <Col xs={24} className="flex justify-end">
              <Button
                size="large"
                onClick={handleResetFilters}
                className="!rounded-2xl !border-slate-200 !text-slate-600 hover:!bg-slate-100"
              >
                🔄 Đặt lại
              </Button>
            </Col>
          </Row>
        </div>

        <div className="text-sm text-slate-600">
          Tìm thấy <strong>{filteredNotifications.length}</strong> thông báo
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={filteredNotifications}
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: 1200 }}
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationList;
