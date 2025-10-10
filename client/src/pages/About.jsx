import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Heart, Users, Mail, Phone, MapPin } from "lucide-react";

const About = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-white pt-20 pb-16 px-6">
      {/* Background ảnh rõ nét */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1500&q=80')",
        }}
      ></div>
      {/* Overlay nhẹ để background nổi nhưng vẫn rõ */}
      <div className="absolute inset-0 bg-white/10"></div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className=" rounded-3xl p-12 text-center "
        >
          <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-4">
            Giới thiệu về <span className="text-blue-500">Nhà Sách Tri Thức</span>
          </h1>
          <p className="text-blue-500 max-w-2xl mx-auto text-lg italic">
            “Lan tỏa tri thức – Nâng tầm giá trị con người”
          </p>
        </motion.div>

        {/* Phần story */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2 gap-10 items-center bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-lg border border-blue-100"
        >
          <motion.img
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0ea?auto=format&fit=crop&w=900&q=80"
            alt="Nhà sách Tri Thức"
            className="rounded-3xl shadow-lg object-cover w-full h-[400px]"
          />

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">
              Câu chuyện của chúng tôi
            </h2>
            <p className="text-blue-500 leading-relaxed mb-4">
              Chào mừng bạn đến với <strong className="text-blue-700">Nhà Sách Tri Thức</strong> – nơi mang đến
              những cuốn sách hay và giá trị nhất, góp phần lan tỏa tri thức đến mọi người.
            </p>
            <p className="text-blue-500 leading-relaxed mb-4">
              Chúng tôi không chỉ đơn thuần là một cửa hàng bán sách, mà còn là nơi
              chia sẻ niềm đam mê đọc sách, là cầu nối giữa tác giả và độc giả, giữa tri thức và cuộc sống.
            </p>
            <p className="text-blue-500 leading-relaxed">
              Với sứ mệnh <strong className="text-blue-700">“Lan tỏa tri thức – Nâng tầm giá trị con người”</strong>, 
              chúng tôi luôn nỗ lực mang đến trải nghiệm mua sắm tiện lợi, thân thiện và đáng tin cậy nhất cho khách hàng.
            </p>
          </motion.div>
        </motion.div>

        {/* Giá trị cốt lõi */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-lg border border-blue-100"
        >
          <h2 className="text-3xl font-bold text-blue-700 mb-10 text-center">
            Giá trị cốt lõi
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <BookOpen className="text-blue-500" size={40} />,
                title: "Tri thức",
                desc: "Không ngừng cập nhật và chia sẻ những cuốn sách giá trị để lan tỏa kiến thức đến mọi người.",
              },
              {
                icon: <Heart className="text-blue-500" size={40} />,
                title: "Tận tâm",
                desc: "Đặt niềm tin và trải nghiệm của khách hàng lên hàng đầu trong mọi hoạt động.",
              },
              {
                icon: <Users className="text-blue-500" size={40} />,
                title: "Cộng đồng",
                desc: "Xây dựng một cộng đồng yêu sách, cùng nhau học hỏi và phát triển bản thân.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100"
              >
                <div className="flex justify-center mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-blue-700 mb-2">{item.title}</h3>
                <p className="text-blue-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Liên hệ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-lg border border-blue-100 text-center"
        >
          <h2 className="text-3xl font-bold text-blue-700 mb-6">
            Liên hệ với chúng tôi
          </h2>
          <p className="text-blue-500 mb-6 max-w-2xl mx-auto">
            Hãy cùng chúng tôi khám phá thế giới qua từng trang sách – nơi bạn có thể tìm thấy cảm hứng, tri thức và những giá trị sống sâu sắc.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-8 text-blue-500 text-sm md:text-base">
            <div className="flex items-center gap-2">
              <Mail className="text-blue-500" size={18} />
              <span>lienhe@nhasachtrithuc.vn</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="text-blue-500" size={18} />
              <span>0123 456 789</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="text-blue-500" size={18} />
              <span>123 Đường Sách, Hà Nội</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
