import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Statistic, Table, Tag, message } from "antd";
import dayjs from "dayjs";

const LibraryFund = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ totalFund: 0, totalRecords: 0, recent: [] });

  const token = localStorage.getItem("adminToken");

  const fetchSummary = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/borrowings/fund/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummary(res.data || { totalFund: 0, totalRecords: 0, recent: [] });
    } catch (error) {
      console.error("Lỗi lấy quỹ thư viện:", error);
      message.error("Không thể tải dữ liệu quỹ thư viện!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const columns = [
    {
      title: "Sách",
      key: "book",
      render: (record) => {
        const book = record.bookSnapshot || {};
        return (
          <div>
            <div className="font-semibold">{book.title || "Không rõ"}</div>
            <div className="text-gray-500 text-xs">
              Tác giả: {book.author || "N/A"} • Mã: {book.isbn || "N/A"}
            </div>
          </div>
        );
      },
    },
    {
      title: "Người đền bù",
      key: "user",
      render: (record) => {
        const user = record.userSnapshot || {};
        return (
          <div>
            <div>{user.fullName || "Không rõ"}</div>
            <div className="text-gray-500 text-xs">{user.email || ""}</div>
          </div>
        );
      },
    },
    {
      title: "Số tiền",
      dataIndex: "compensationAmount",
      key: "amount",
      render: (v) => (
        <span className="font-semibold text-red-600">
          {v?.toLocaleString("vi-VN") || 0} VNĐ
        </span>
      ),
    },
    {
      title: "Ngày thanh toán",
      dataIndex: "paymentDate",
      key: "paymentDate",
      render: (d) => (d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "—"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: () => (
        <Tag color="green">
          Đã đền bù
        </Tag>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Quỹ thư viện (tiền đền bù)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card bordered={false} className="shadow-md rounded-2xl">
            <Statistic
              title="Tổng tiền đền bù đã thu"
              value={summary.totalFund}
              valueStyle={{ color: "#dc2626" }}
              precision={0}
              formatter={(v) => `${Number(v || 0).toLocaleString("vi-VN")} VNĐ`}
            />
          </Card>
          <Card bordered={false} className="shadow-md rounded-2xl">
            <Statistic
              title="Số lượt đền bù"
              value={summary.totalRecords}
              valueStyle={{ color: "#2563eb" }}
            />
          </Card>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-4">
          <h3 className="text-lg font-semibold mb-3">Các lần đền bù gần đây</h3>
          <Table
            rowKey={(_, idx) => idx}
            columns={columns}
            dataSource={summary.recent}
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </div>
      </div>
    </div>
  );
};

export default LibraryFund;


