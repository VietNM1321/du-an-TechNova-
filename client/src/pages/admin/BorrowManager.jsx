import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Tag, Space, Button, message } from 'antd';

const BorrowManager = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(false);

  const getStatusTag = (status, returnDate) => {
    if (status === 'returned') return <Tag color="green">Đã trả</Tag>;
    if (status === 'damaged') return <Tag color="orange">Hỏng / Mất</Tag>;
    if (status === 'borrowed' && returnDate && new Date(returnDate) < new Date())
      return <Tag color="red">Quá hạn</Tag>;
    return <Tag color="blue">Đang mượn</Tag>;
  };

  const fetchBorrowings = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/borrowings');
      setBorrowings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('❌ Error fetching borrowings:', err);
      message.error('Lỗi khi tải danh sách mượn sách');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowings();

    // SSE (nếu backend có stream)
    let es;
    try {
      es = new EventSource('http://localhost:5000/api/borrowings/stream');
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data?.type === 'new_borrowings') fetchBorrowings();
        } catch {}
      };
    } catch (err) {
      console.warn('SSE không khả dụng:', err);
    }

    return () => {
      if (es) es.close();
    };
  }, []);

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: '_id',
      key: '_id',
      width: '15%',
    },
    {
      title: 'Người mượn',
      key: 'user',
      width: '20%',
      render: (record) => (
        <div>
          <div>{record.userSnapshot?.fullName || record.user?.fullName || 'Khách vãng lai'}</div>
          <div className="text-gray-500 text-sm">{record.userSnapshot?.email || record.user?.email}</div>
        </div>
      ),
    },
    {
      title: 'Sách',
      key: 'book',
      width: '25%',
      render: (record) => (
        <div>
          <div className="font-medium">{record.bookSnapshot?.title || record.book?.title || 'N/A'}</div>
          <div className="text-gray-500 text-sm">
            Tác giả: {record.bookSnapshot?.author?.name || record.book?.author?.name || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '10%',
      align: 'center',
    },
    {
      title: 'Ngày mượn',
      dataIndex: 'borrowDate',
      key: 'borrowDate',
      width: '15%',
      render: (date) => (date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'),
    },
    {
      title: 'Ngày hẹn trả',
      dataIndex: 'returnDate',
      key: 'returnDate',
      width: '15%',
      render: (date) => (date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (text, record) => getStatusTag(record.status, record.returnDate),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {record.status === 'borrowed' && (
            <Button
              type="primary"
              onClick={async () => {
                try {
                  await axios.put(`http://localhost:5000/api/borrowings/${record._id}/return`);
                  message.success('✅ Xác nhận trả sách thành công');
                  fetchBorrowings();
                } catch (err) {
                  console.error(err);
                  message.error('Lỗi khi cập nhật trạng thái trả sách');
                }
              }}
            >
              Xác nhận trả sách
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Quản lý đơn mượn sách</h2>
        <Button type="primary" onClick={fetchBorrowings} loading={loading}>
          Làm mới
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={borrowings}
        rowKey="_id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng số ${total} đơn mượn`,
        }}
      />
    </div>
  );
};

export default BorrowManager;
