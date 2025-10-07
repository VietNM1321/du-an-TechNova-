import React from "react";

function News() {
  const newsList = [
    {
      title: "Ra mắt bộ sưu tập sách mới tháng 10",
      date: "07/10/2025",
      content:
        "Nhà Sách Tri Thức vừa cập nhật bộ sưu tập hơn 100 tựa sách mới, đa dạng thể loại từ tiểu thuyết, kỹ năng sống đến sách học thuật.",
    },
    {
      title: "Ưu đãi đặc biệt dành cho thành viên thân thiết",
      date: "02/10/2025",
      content:
        "Khách hàng thành viên khi mua sắm trong tháng 10 sẽ được giảm 15% trên tổng hóa đơn và nhận thêm voucher cho đơn hàng kế tiếp.",
    },
    {
      title: "Chương trình giao lưu cùng tác giả nổi tiếng",
      date: "25/09/2025",
      content:
        "Buổi gặp gỡ và ký tặng cùng tác giả Nguyễn Nhật Ánh sẽ được tổ chức vào ngày 15/10 tại Nhà Sách Tri Thức, TP. Hồ Chí Minh.",
    },
  ];

  return (
    <div className="p-6 bg-[#faf8f5] min-h-screen">
      <h1 className="text-3xl font-bold text-center text-[#8b5e34] mb-8">
        Tin tức mới nhất
      </h1>

      <div className="max-w-5xl mx-auto space-y-6">
        {newsList.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
          >
            <h2 className="text-2xl font-semibold text-[#8b5e34] mb-2">
              {item.title}
            </h2>
            <p className="text-sm text-gray-500 mb-3">{item.date}</p>
            <p className="text-gray-700">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default News;
