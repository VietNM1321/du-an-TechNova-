import { motion } from "framer-motion";

const AdminFooter = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 mt-8 shadow-inner">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center text-sm text-gray-600"
      >
        © {new Date().getFullYear()}{" "}
        <span className="text-blue-600 font-semibold">LiNova Admin</span>. All rights reserved.
      </motion.div>
    </footer>
  );
};

export default AdminFooter;
