import React, { useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Table, Tag, Space, Image, Tooltip, Button, Modal, message } from "antd";
import dayjs from "dayjs";
import axios from "axios";
import { ArrowLeftOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

const ImportDetail = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [group, setGroup] = useState(location.state?.group || null);

  if (!group) {
    navigate("/admin/importlist");
    return null;
  }

  // Cột cho bảng chi tiết (phiếu nhập cá nhân trong 1 nhóm ngày)
  const detailColumns = [
    {
      title: "Mã phiếu",
      dataIndex: "importCode",
      key: "importCode",
      render: (code) => (
        <Tooltip title={code}>
          <Tag color="cyan" icon="🔖">
            {code || "—"}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: "Sách nhập",
      key: "book",
      render: (_, record) => {
        const book = record.book || {};
        let thumb = book.images?.[0];
        if (thumb && !thumb.startsWith("http")) thumb = `http://localhost:5000/${thumb}`;
        const placeholder = "https://via.placeholder.com/40x60?text=?";
        return (
          <Space>
            <Image width={40} height={60} src={thumb || placeholder} preview={false} />
            <span>{book.title || "—"}</span>
          </Space>
        );
      },
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity) => (
        <span className="font-semibold text-green-600">
          {quantity || 0} quyển
        </span>
      ),
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplier",
      key: "supplier",
      render: (supplier) => supplier || "—",
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (note) => (
        <Tooltip title={note || "Không có ghi chú"}>
          <span>{note ? note.substring(0, 30) + (note.length > 30 ? "..." : "") : "—"}</span>
        </Tooltip>
      ),
    },
    {
      title: "Người nhập",
      key: "user",
      render: (_, record) => {
        const role = record.user?.role?.toLowerCase().trim();
        const roleLabel = role === "admin" ? "Admin" : role ? "Thủ thư" : "Admin";
        const fullName =
          record.user?.fullName && record.user.fullName !== "Chưa cập nhật"
            ? record.user.fullName
            : null;
        const displayUser = record.userLabel
          ? record.userLabel
          : record.user
            ? fullName
              ? `${fullName} (${roleLabel})`
              : roleLabel
            : roleLabel;
        return <span>{displayUser}</span>;
      },
    },
    {
      title: "Ngày nhập",
      key: "importDate",
      render: (_, record) => {
        const importDate = record.importDate || record.createdAt;
        return dayjs(importDate).format("DD/MM/YYYY HH:mm");
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          danger
          onClick={() => handleDelete(record._id)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc muốn xóa phiếu nhập này không?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await axios.delete(`http://localhost:5000/api/imports/${id}`);
          message.success("✅ Xóa thành công!");
          
          // Cập nhật state ngay lập tức
          setGroup((prev) => {
            if (!prev) return prev;
            const updatedItems = prev.items.filter(it => it._id !== id);
            return {
              ...prev,
              items: updatedItems,
              totalQuantity: updatedItems.reduce((sum, it) => sum + (it.quantity || 0), 0),
              totalBooks: updatedItems.length,
            };
          });
        } catch (error) {
          console.error(error);
          message.error("Không thể xóa phiếu nhập!");
        }
      },
    });
  };

  return (
    <div style={{ padding: "0 40px 24px" }}>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/admin/importlist")}
          type="text"
        >
          Quay lại
        </Button>
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
          <span role="img" aria-label="detail">📦</span>
          <span>Chi tiết nhập kho ngày {dayjs(group.importDate).format("DD/MM/YYYY")}</span>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <div style={{ padding: 12, background: "#f0f5ff", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Tổng số loại sách</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1677ff" }}>
              {group.totalBooks} loại
            </div>
          </div>
          <div style={{ padding: 12, background: "#f6ffed", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Tổng số lượng</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#52c41a" }}>
              {group.totalQuantity} quyển
            </div>
          </div>
        </div>
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
          rowKey={(r) => r._id}
          columns={detailColumns}
          dataSource={group.items}
          pagination={{ pageSize: 10 }}
          bordered
        />
      </div>

      {group.items.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "#999" }}>
          📭 Không có phiếu nhập nào trong nhóm này.
        </div>
      )}
    </div>
  );
};

export default ImportDetail;
