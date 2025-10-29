import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Tag, Space, Button, message } from 'antd';
const BorrowManager = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBorrowings();
    const interval = setInterval(fetchBorrowings, 30000);
    let es;
    try {
      es = new EventSource('http://localhost:5000/api/borrowings/stream');
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data && data.type === 'new_borrowings') {
            fetchBorrowings();
          }
        } catch (err) {
        }
      };
    } catch (err) {
      console.warn('SSE not available:', err);
    }

    return () => {
      clearInterval(interval);
      if (es) es.close();
    };
  }, []);

  const fetchBorrowings = async () => {
    try {
      setLoading(true);
  const response = await axios.get('http://localhost:5000/api/borrowings/all');
      setBorrowings(response.data);
    } catch (error) {
      console.error('Error fetching borrowings:', error);
      message.error('Lỗi khi tải danh sách mượn sách');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status, dueDate) => {
    if (status === 'returned') return <Tag color="green">Đã trả</Tag>;
    if (!dueDate) return <Tag color="default">Chưa có hạn</Tag>;
    const now = new Date();
    const due = new Date(dueDate);
    if (now > due) return <Tag color="red">Quá hạn</Tag>;
    return <Tag color="blue">Đang mượn</Tag>;
  };

  const columns = [
    {
      title: 'Mã đơn mượn',
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
          <div>{record.userSnapshot?.name || 'N/A'}</div>
          <div className="text-gray-500 text-sm">{record.userSnapshot?.email || 'N/A'}</div>
        </div>
      ),
    },
    {
      title: 'Sách',
      key: 'book',
      width: '25%',
      render: (record) => (
        <div>
          <div className="font-medium">{record.bookSnapshot?.title || 'N/A'}</div>
          <div className="text-gray-500 text-sm">
            Tác giả: {record.bookSnapshot?.author?.name || 'N/A'}
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
      render: (date, record) => {
        const borrowDate = record.borrowDate || record.cartData?.borrowDate;
        if (!borrowDate) return 'N/A';
        const d = new Date(borrowDate);
        return d.toLocaleDateString('vi-VN');
      },
    },
    {
      title: 'Ngày hẹn trả',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: '15%',
      render: (date, record) => {
        const returnDate = record.dueDate || record.cartData?.returnDate;
        if (!returnDate) return 'N/A';
        const d = new Date(returnDate);
        return d.toLocaleDateString('vi-VN');
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (text, record) => getStatusTag(record.status, record.dueDate),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {record.status !== 'returned' && (
            <Button 
              type="primary"
              onClick={async () => {
                try {
                  await axios.put(`http://localhost:5000/api/borrowings/${record._id}/return`);
                  message.success('Cập nhật trạng thái thành công');
                  fetchBorrowings();
                } catch (error) {
                  message.error('Lỗi khi cập nhật trạng thái');
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
    <div style={{ padding: '20px' }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Quản lý đơn mượn sách</h2>
        <Button type="primary" onClick={fetchBorrowings} loading={loading}>
          Làm mới dữ liệu
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
          showTotal: (total) => `Tổng số ${total} đơn mượn`
        }}
      />
    </div>
  );
};

export default BorrowManager;