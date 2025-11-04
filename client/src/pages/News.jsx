import React from "react";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaArrowRight } from "react-icons/fa";

function News() {
  const newsList = [
    {
      title: "Ra mắt bộ sưu tập sách mới tháng 10",
      date: "07/10/2025",
      content:
        "Nhà Sách Tri Thức vừa cập nhật bộ sưu tập hơn 100 tựa sách mới, đa dạng thể loại từ tiểu thuyết, kỹ năng sống đến sách học thuật.",
      image:
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80",
    },
    {
      title: "Ưu đãi đặc biệt dành cho thành viên thân thiết",
      date: "02/10/2025",
      content:
        "Khách hàng thành viên khi mua sắm trong tháng 10 sẽ được giảm 15% trên tổng hóa đơn và nhận thêm voucher cho đơn hàng kế tiếp.",
      image:
        "https://images.unsplash.com/photo-1603575448550-efbcb3b6b8b6?auto=format&fit=crop&w=900&q=80",
    },
    {
      title: "Chương trình giao lưu cùng tác giả nổi tiếng",
      date: "25/09/2025",
      content:
        "Buổi gặp gỡ và ký tặng cùng tác giả Nguyễn Nhật Ánh sẽ được tổ chức vào ngày 15/10 tại Nhà Sách Tri Thức, TP. Hồ Chí Minh.",
      image:
        "https://images.unsplash.com/photo-1514894786522-e0a3c9ad6e4d?auto=format&fit=crop&w=900&q=80",
    },
    {
      title: "Workshop: Hành trình trở thành người yêu sách",
      date: "20/09/2025",
      content:
        "Chương trình chia sẻ kỹ năng đọc hiệu quả và cách chọn sách phù hợp được tổ chức miễn phí dành cho học sinh – sinh viên.",
      image:
        "https://images.unsplash.com/photo-1509027572322-2e0e2c89088b?auto=format&fit=crop&w=900&q=80",
    },
    {
      title: "Tri ân Ngày Phụ Nữ Việt Nam 20/10",
      date: "10/09/2025",
      content:
        "Nhà Sách Tri Thức gửi tặng 20% ưu đãi dành cho tất cả độc giả nữ trong tuần lễ đặc biệt chào mừng 20/10.",
      image:
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80",
    },
    {
      title: "Cập nhật tủ sách thiếu nhi 2025",
      date: "01/09/2025",
      content:
        "Bộ sưu tập truyện thiếu nhi được chọn lọc mới nhất, giúp khơi dậy niềm đam mê đọc sách cho các em nhỏ.",
      image:
        "https://images.unsplash.com/photo-1528209392022-6a3f88e42c01?auto=format&fit=crop&w=900&q=80",
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Background overlay nhẹ giống About */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1500&q=80')",
        }}
      ></div>

      {/* Nội dung chính */}
      <div className="relative z-10 py-20 px-6">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-center text-blue-700 mb-12"
        >
          📰 Tin tức mới nhất
        </motion.h1>

        <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {newsList.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.03 }}
              className="bg-white/95 rounded-2xl shadow-lg border border-blue-100 overflow-hidden hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
            >
              {/* Ảnh */}
              <div className="h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Nội dung */}
              <div className="p-6 flex flex-col justify-between h-[230px]">
                <div>
                  <h2 className="text-lg font-semibold text-blue-700 mb-2 hover:text-blue-500 transition">
                    {item.title}
                  </h2>
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <FaCalendarAlt className="mr-2 text-blue-500" />
                    {item.date}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {item.content}
                  </p>
                </div>

                <div className="mt-4 text-right">
                  <button className="inline-flex items-center text-blue-700 hover:text-blue-500 text-sm font-medium transition">
                    Đọc thêm <FaArrowRight className="ml-2" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default News;
