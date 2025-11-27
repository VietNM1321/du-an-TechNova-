import React from "react";
import { motion } from "framer-motion";

const Policies = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Background hình rõ hơn */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1500&q=80')",
        }}
      ></div>

      {/* Overlay mờ nhẹ để đọc dễ hơn */}
      <div className="absolute inset-0 bg-white/10"></div>

      {/* Nội dung chính */}
      <div className="relative z-10 py-16 px-6">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-4xl font-bold text-center md:text-5xl text-blue-700 mb-10"
        >
          Chính sách bảo mật
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-4xl mx-auto bg-white/90 rounded-2xl shadow-xl p-8 md:p-10 leading-relaxed border border-blue-100 backdrop-blur-sm"
        >
          <p className="text-gray-700 mb-6 text-justify">
            Chúng tôi cam kết bảo vệ quyền riêng tư và thông tin cá nhân của khách hàng.
            Mọi dữ liệu bạn cung cấp sẽ được xử lý cẩn trọng và bảo mật tuyệt đối.
          </p>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-3">
              1. Thu thập thông tin
            </h2>
            <p className="text-gray-700 text-justify">
              Chúng tôi chỉ thu thập thông tin cần thiết như họ tên, email, số điện thoại
              và địa chỉ giao hàng nhằm phục vụ cho việc mua bán và chăm sóc khách hàng.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-3">
              2. Sử dụng thông tin
            </h2>
            <p className="text-gray-700 text-justify">
              Thông tin cá nhân được sử dụng để xử lý đơn hàng, thông báo khuyến mãi
              hoặc hỗ trợ khách hàng khi cần thiết. Chúng tôi không chia sẻ thông tin
              của bạn cho bên thứ ba nếu không có sự đồng ý.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-3">
              3. Bảo mật thông tin
            </h2>
            <p className="text-gray-700 text-justify">
              Chúng tôi áp dụng các biện pháp kỹ thuật và an ninh tiên tiến để bảo vệ dữ liệu
              cá nhân của bạn khỏi truy cập trái phép, mất mát hoặc lạm dụng. Mọi giao dịch
              đều được mã hóa để đảm bảo an toàn tuyệt đối.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-blue-700 mb-3">
              4. Liên hệ
            </h2>
            <p className="text-gray-700 text-justify">
              Nếu bạn có bất kỳ thắc mắc nào về chính sách bảo mật, vui lòng liên hệ qua email:{" "}
              <span className="text-blue-500 font-medium hover:underline">
                baomat@nhasachtrithuc.vn
              </span>
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default Policies;
