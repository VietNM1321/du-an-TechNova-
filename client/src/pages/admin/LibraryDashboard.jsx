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
      ["Metric", "Value"],
      ["Total Users", data.users?.totalUsers || 0],
      ["Students", data.users?.totalStudents || 0],
      ["Admins", data.users?.totalAdmins || 0],
      ["Librarians", data.users?.totalLibrarians || 0],
      ["Active Users", data.users?.activeUsers || 0],
      ["Inactive Users", data.users?.inactiveUsers || 0],
      ["Users who borrowed", data.users?.countUsersBorrowed || 0],
      ["Users never borrowed", data.users?.countUsersNeverBorrowed || 0],
    ];
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(usersSummary),
      "UsersSummary"
    );

    const borrowSummary = [
      ["Metric", "Value"],
      ["Total Borrowings", data.borrowings?.totalBorrowings || 0],
      ["Active Borrowings", data.borrowings?.activeBorrowings || 0],
      ["Returned", data.borrowings?.returnedCount || 0],
      ["Overdue", data.borrowings?.overdueCount || 0],
      ["Damaged", data.borrowings?.damagedCount || 0],
      ["Lost", data.borrowings?.lostCount || 0],
      ["Total Compensation", data.borrowings?.totalCompensation || 0],
    ];
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(borrowSummary),
      "BorrowSummary"
    );

    const monthly = [["Month", "BorrowCount", "Returned", "Overdue"]];
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
      ["FullName", "StudentCode", "Email", "Course", "BorrowCount"],
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

    const topBooksSheet = [["Title", "BorrowCount"]];
    (data.topBooks || []).forEach((t) =>
      topBooksSheet.push([t.book?.title || "-", t.count || 0])
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(topBooksSheet),
      "TopBooks"
    );

    XLSX.writeFile(wb, "Library_Statistics.xlsx");
  };

  // Export PDF
  const exportPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Library Statistics", 14, 16);

    doc.autoTable({
      startY: 22,
      head: [["Metric", "Value"]],
      body: [
        ["Total Users", data.users?.totalUsers || 0],
        ["Students", data.users?.totalStudents || 0],
        ["Admins", data.users?.totalAdmins || 0],
        ["Librarians", data.users?.totalLibrarians || 0],
        ["Active Users", data.users?.activeUsers || 0],
      ],
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 6,
      head: [["Metric", "Value"]],
      body: [
        ["Total Borrowings", data.borrowings?.totalBorrowings || 0],
        ["Active Borrowings", data.borrowings?.activeBorrowings || 0],
        ["Returned", data.borrowings?.returnedCount || 0],
        ["Overdue", data.borrowings?.overdueCount || 0],
        ["Total Compensation", data.borrowings?.totalCompensation || 0],
      ],
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 6,
      head: [["Top Book", "Borrowed"]],
      body: (data.topBooks || []).map((t) => [
        t.book?.title || "-",
        t.count || 0,
      ]),
      styles: { fontSize: 9 },
    });

    doc.save("Library_Statistics.pdf");
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
    { title: "Title", dataIndex: ["book", "title"] },
    { title: "Borrowed Qty", dataIndex: "count" },
  ];

  const topBorrowersColumns = [
    { title: "#", render: (_, __, idx) => idx + 1 },
    { title: "FullName", dataIndex: ["userInfo", "fullName"] },
    { title: "StudentCode", dataIndex: ["userInfo", "studentCode"] },
    { title: "Email", dataIndex: ["userInfo", "email"] },
    { title: "BorrowCount", dataIndex: "borrowCount" },
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
            title="📚 Library Dashboard"
            extra={
              <Space>
                <Button onClick={exportExcel}>Export Excel</Button>
                <Button onClick={exportPDF}>Export PDF</Button>
                <Button onClick={fetchData}>Refresh</Button>
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Total Users"
                  value={data?.users?.totalUsers || 0}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Students"
                  value={data?.users?.totalStudents || 0}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Active Users"
                  value={data?.users?.activeUsers || 0}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Users borrowed"
                  value={data?.users?.countUsersBorrowed || 0}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col lg={8} md={24}>
          <Card title="Status Distribution">
            {statusPieData.length === 0 ? (
              <div style={{ textAlign: "center" }}>No data</div>
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

          <Card title="Top Books" style={{ marginTop: 12 }}>
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
                <h3>Borrowings over months</h3>
              </Col>
              <Col>
                <Search
                  placeholder="Filter top borrowers..."
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

            <Card style={{ marginTop: 12 }} title="Top Borrowers">
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
          <Card title="Raw / Debug JSON (Preview)">
            <pre style={{ maxHeight: 300, overflow: "auto" }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
