import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Space,
  Spin,
  Input,
  Button,
  message,
} from "antd";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const { Search } = Input;

export default function LibraryDashboard() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/statistics/library");

      setData(res.data);
    } catch (err) {
      console.error(err);
      message.error(
        "Không lấy được dữ liệu thống kê. Kiểm tra API /api/statistics/library"
      );
    } finally {
      setLoading(false);
    }
  };

  // Export Excel
  const exportExcel = () => {
    if (!data) return;
    const wb = XLSX.utils.book_new();

    const usersSummary = [
      ["Chỉ số", "Giá trị"],
      ["Tổng người dùng", data.users?.totalUsers || 0],
      ["Sinh viên", data.users?.totalStudents || 0],
      ["Quản trị viên", data.users?.totalAdmins || 0],
      ["Thủ thư", data.users?.totalLibrarians || 0],
      ["Người dùng hoạt động", data.users?.activeUsers || 0],
      ["Người dùng không hoạt động", data.users?.inactiveUsers || 0],
      ["Người đã mượn sách", data.users?.countUsersBorrowed || 0],
      ["Người chưa mượn sách", data.users?.countUsersNeverBorrowed || 0],
    ];
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(usersSummary),
      "UsersSummary"
    );

    const borrowSummary = [
      ["Chỉ số", "Giá trị"],
      ["Tổng lượt mượn", data.borrowings?.totalBorrowings || 0],
      ["Lượt mượn đang hoạt động", data.borrowings?.activeBorrowings || 0],
      ["Đã trả", data.borrowings?.returnedCount || 0],
      ["Quá hạn", data.borrowings?.overdueCount || 0],
      ["Hư hỏng", data.borrowings?.damagedCount || 0],
      ["Mất", data.borrowings?.lostCount || 0],
      ["Tổng bồi thường", data.borrowings?.totalCompensation || 0],
    ];
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(borrowSummary),
      "BorrowSummary"
    );

    const monthly = [["Tháng", "Lượt mượn", "Đã trả", "Quá hạn"]];
    (data.borrowings?.monthlyStats || []).forEach((m) =>
      monthly.push([
        m._id?.month || m._id || "-",
        m.borrowCount || 0,
        m.returned || 0,
        m.overdue || 0,
      ])
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(monthly),
      "MonthlyStats"
    );

    const topBorrowersSheet = [
      ["Họ tên", "Mã sinh viên", "Email", "Khóa học", "Lượt mượn"],
    ];
    (data.topBorrowers || []).forEach((t) =>
      topBorrowersSheet.push([
        t.userInfo?.fullName || "-",
        t.userInfo?.studentCode || "-",
        t.userInfo?.email || "-",
        t.userInfo?.course || "-",
        t.borrowCount || 0,
      ])
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(topBorrowersSheet),
      "TopBorrowers"
    );

    const topBooksSheet = [["Tiêu đề", "Lượt mượn"]];
    (data.topBooks || []).forEach((t) =>
      topBooksSheet.push([t.book?.title || "-", t.count || 0])
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(topBooksSheet),
      "TopBooks"
    );

    XLSX.writeFile(wb, "Thống kê thư viện.xlsx");
  };

  // Export PDF
  const exportPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Thống kê thư viện", 14, 16);

    doc.autoTable({
      startY: 22,
      head: [["Chỉ số", "Giá trị"]],
      body: [
        ["Tổng người dùng", data.users?.totalUsers || 0],
        ["Sinh viên", data.users?.totalStudents || 0],
        ["Quản trị viên", data.users?.totalAdmins || 0],
        ["Thủ thư", data.users?.totalLibrarians || 0],
        ["Người dùng hoạt động", data.users?.activeUsers || 0],
      ],
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 6,
      head: [["Chỉ số", "Giá trị"]],
      body: [
        ["Tổng lượt mượn", data.borrowings?.totalBorrowings || 0],
        ["Lượt mượn đang hoạt động", data.borrowings?.activeBorrowings || 0],
        ["Đã trả", data.borrowings?.returnedCount || 0],
        ["Quá hạn", data.borrowings?.overdueCount || 0],
        ["Tổng bồi thường", data.borrowings?.totalCompensation || 0],
      ],
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 6,
      head: [["Sách phổ biến", "Lượt mượn"]],
      body: (data.topBooks || []).map((t) => [
        t.book?.title || "-",
        t.count || 0,
      ]),
      styles: { fontSize: 9 },
    });

    doc.save("Thống kê thư viện.pdf");
  };

  // PIE DATA
  const statusPieData = (data?.borrowings?.statusStats || []).map((s) => ({
    name: s._id,
    value: s.count,
  }));

  // MONTHLY
  const monthlyChartData = (data?.borrowings?.monthlyStats || []).map((m) => ({
    month: m._id?.month || m._id || "-",
    borrow: m.borrowCount || 0,
    returned: m.returned || 0,
    overdue: m.overdue || 0,
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A", "#6A5ACD"];

  const topBooksColumns = [
    { title: "#", render: (_, __, idx) => idx + 1 },
    { title: "Tiêu đề", dataIndex: ["book", "title"] },
    { title: "Lượt mượn", dataIndex: "count" },
  ];

  const topBorrowersColumns = [
    { title: "#", render: (_, __, idx) => idx + 1 },
    { title: "Họ tên", dataIndex: ["userInfo", "fullName"] },
    { title: "Mã sinh viên", dataIndex: ["userInfo", "studentCode"] },
    { title: "Email", dataIndex: ["userInfo", "email"] },
    { title: "Lượt mượn", dataIndex: "borrowCount" },
  ];

  if (loading)
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );

  return (
    <div style={{ padding: 20 }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title="📚 Bảng điều khiển thư viện"
            extra={
              <Space>
                <Button onClick={exportExcel}>Xuất Excel</Button>
                <Button onClick={exportPDF}>Xuất PDF</Button>
                <Button onClick={fetchData}>Làm mới</Button>
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Tổng người dùng"
                  value={data?.users?.totalUsers || 0}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Sinh viên"
                  value={data?.users?.totalStudents || 0}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Người dùng hoạt động"
                  value={data?.users?.activeUsers || 0}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Người đã mượn sách"
                  value={data?.users?.countUsersBorrowed || 0}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col lg={8} md={24}>
          <Card title="Phân bố trạng thái">
            {statusPieData.length === 0 ? (
              <div style={{ textAlign: "center" }}>Không có dữ liệu</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    label
                  >
                    {statusPieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ReTooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card title="Sách được mượn nhiều nhất" style={{ marginTop: 12 }}>
            <Table
              columns={topBooksColumns}
              dataSource={data?.topBooks || []}
              rowKey={(r) => r.book?._id || r._id}
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </Card>
        </Col>

        <Col lg={16} md={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <h3>Lượt mượn theo tháng</h3>
              </Col>
              <Col>
                <Search
                  placeholder="Lọc những người mượn nhiều nhất..."
                  allowClear
                  onSearch={(v) => setFilter(v)}
                  style={{ width: 240 }}
                />
              </Col>
            </Row>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={monthlyChartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ReTooltip />
                <Legend />
                <Line type="monotone" dataKey="borrow" stroke="#8884d8" />
                <Line type="monotone" dataKey="returned" stroke="#82ca9d" />
                <Bar dataKey="overdue" fill="#FF8042" />
              </LineChart>
            </ResponsiveContainer>

            <Card style={{ marginTop: 12 }} title="Những người mượn sách nhiều nhất">
              <Table
                columns={topBorrowersColumns}
                dataSource={(data?.topBorrowers || []).filter((t) => {
                  if (!filter) return true;
                  const q = filter.toLowerCase();
                  return (
                    t.userInfo?.fullName?.toLowerCase().includes(q) ||
                    t.userInfo?.studentCode?.toLowerCase().includes(q) ||
                    t.userInfo?.email?.toLowerCase().includes(q)
                  );
                })}
                rowKey={(r) => r._id || r.userInfo?._id}
                pagination={{ pageSize: 8 }}
              />
            </Card>
          </Card>
        </Col>

        <Col span={24} style={{ marginTop: 12 }}>
          <Card title="Dữ liệu JSON (Xem trước)">
            <pre style={{ maxHeight: 300, overflow: "auto" }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
