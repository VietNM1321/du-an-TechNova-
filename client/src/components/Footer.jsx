import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import logo from "../assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-white text-gray-700 border-t border-gray-200 mt-16">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link to="/" className="flex items-center gap-3 mb-4">
            <img src={logo} alt="logo" className="w-auto h-10" />
          </Link>
          <p className="text-gray-600 text-sm leading-6">
            Khám phá kho tri thức khổng lồ. Đọc sách mọi lúc, mọi nơi cùng thư
            viện online của chúng tôi.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="font-semibold text-lg mb-4 text-gray-900">
            Liên kết nhanh
          </h3>
          <ul className="space-y-2 text-sm">
            {[
              { label: "Trang chủ", path: "/" },
              { label: "Giới thiệu", path: "/about" },
              { label: "Tin tức", path: "/news" },
              { label: "Chính sách", path: "/policies" },
              { label: "Liên hệ", path: "/contact" },
            ].map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="hover:text-blue-600 transition-colors duration-200"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="font-semibold text-lg mb-4 text-gray-900">
            Liên hệ
          </h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-600" /> Hà Nội, Việt Nam
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-blue-600" /> 0123 456 789
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-blue-600" /> contact@bookzone.com
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h3 className="font-semibold text-lg mb-4 text-gray-900">
            Kết nối với chúng tôi
          </h3>
          <div className="flex gap-4 text-xl">
            {[
              { icon: <Facebook />, link: "#" },
              { icon: <Twitter />, link: "#" },
              { icon: <Instagram />, link: "#" },
            ].map((social, index) => (
              <motion.a
                key={index}
                href={social.link}
                whileHover={{ scale: 1.2 }}
                className="text-gray-600 hover:text-blue-600 transition"
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="border-t border-gray-200 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()}{" "}
        <span className="text-blue-600 font-semibold">BookZone</span>. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
