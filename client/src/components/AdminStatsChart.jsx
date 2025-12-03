import React from "react";
import {Chart as ChartJS,CategoryScale,LinearScale,PointElement,LineElement,Title,Tooltip,Legend,} from "chart.js";
import { Line } from "react-chartjs-2";
ChartJS.register(CategoryScale,LinearScale,PointElement,LineElement,Title,Tooltip,Legend);
const AdminStatsChart = ({ title = "Thống kê hàng tháng", data = null }) => {
  const sample = {
    labels: [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
    ],
    datasets: [
      {
        label: "Đơn hàng",
        data: [12, 19, 8, 15, 22, 18],
        borderColor: "#2563EB",
        backgroundColor: "rgba(37,99,235,0.2)",
        tension: 0.3,
        fill: true,
        pointRadius: 4,
      },
      {
        label: "Người dùng mới",
        data: [5, 9, 6, 10, 14, 11],
        borderColor: "#10B981",
        backgroundColor: "rgba(16,185,129,0.15)",
        tension: 0.3,
        fill: true,
        pointRadius: 4,
      },
    ],
  };
  const chartData = data || sample;
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      title: { display: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#f3f4f6" }, beginAtZero: true },
    },
  };
  return (
    <div className="bg-white rounded-lg shadow p-4 h-64">
      <div className="text-lg font-semibold mb-2">{title}</div>
      <div className="w-full h-44">
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
};

export default AdminStatsChart;
