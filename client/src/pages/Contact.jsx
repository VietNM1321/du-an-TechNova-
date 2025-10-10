import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail } from "lucide-react";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Background image rõ nét */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1500&q=80')",
        }}
      ></div>

      {/* Overlay nhẹ, không làm mờ background */}
      <div className="absolute inset-0 bg-white/10"></div>

      <div className="relative z-10 py-16 px-6">
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold md:text-5xl text-blue-700 mb-3 "
          >
            Liên hệ với chúng tôi
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-blue-500 max-w-2xl mx-auto"
          >
            Nếu bạn có bất kỳ thắc mắc hoặc góp ý nào, hãy gửi tin nhắn cho chúng tôi.
            Chúng tôi sẽ phản hồi trong thời gian sớm nhất!
          </motion.p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-start">
          {/* Cột thông tin */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 p-8 rounded-2xl shadow-lg border border-blue-100"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-blue-700 mb-4">
              Thông tin liên hệ
            </h2>

            <ul className="space-y-4 text-blue-500">
              <li className="flex items-center gap-3">
                <MapPin className="text-blue-700" />
                <span>123 Đường Sách, Quận 1, TP. HCM</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-blue-700" />
                <span>0123 456 789</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-blue-700" />
                <span>lienhe@nhasachtrithuc.vn</span>
              </li>
            </ul>

            <div className="mt-8">
              <iframe
                title="Google Maps"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.436485772798!2d106.70042387581003!3d10.777305189373708!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3c19a5cf2b%3A0x9b4e3f2d7b08c81e!2zUXXhuq1uIDEsIFRQLiBI4buNYyBDaMOtbmgsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1695030202356!5m2!1svi!2s"
                width="100%"
                height="250"
                allowFullScreen=""
                loading="lazy"
                className="rounded-xl shadow-md border border-blue-100"
              ></iframe>
            </div>
          </motion.div>

          {/* Form liên hệ */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 p-8 rounded-2xl shadow-lg border border-blue-100"
          >
            <h2 className="text-2xl font-semibold text-blue-700 mb-6">
              Gửi tin nhắn cho chúng tôi
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-blue-500 font-medium mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-blue-100 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-blue-500 font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-blue-100 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-blue-500 font-medium mb-1">
                  Tin nhắn
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  required
                  className="w-full border border-blue-100 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-200 outline-none transition"
                ></textarea>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg shadow-md transition"
              >
                Gửi liên hệ
              </motion.button>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}

export default Contact;
