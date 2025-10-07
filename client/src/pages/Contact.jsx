import React, { useState } from "react";

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
    <div className="p-6 bg-[#faf8f5] min-h-screen">
      {/* Tiêu đề */}
      <h1 className="text-3xl font-bold text-center text-[#8b5e34] mb-8">
        Liên hệ với chúng tôi
      </h1>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 grid md:grid-cols-2 gap-8">
        {/* Thông tin liên hệ */}
        <div className="space-y-5">
          <h2 className="text-2xl font-semibold text-[#8b5e34] mb-3">
            Thông tin liên hệ
          </h2>
          <p className="text-gray-700">
            Nếu bạn có bất kỳ thắc mắc, góp ý hay cần hỗ trợ, 
            hãy gửi tin nhắn cho chúng tôi qua form bên cạnh hoặc liên hệ trực tiếp qua:
          </p>
          <ul className="text-gray-700 space-y-2 mt-4">
            <li>
              📍 <span className="font-medium">Địa chỉ:</span> 123 Đường Sách, Quận 1, TP.HCM
            </li>
            <li>
              📞 <span className="font-medium">Hotline:</span> 0123 456 789
            </li>
            <li>
              ✉️ <span className="font-medium">Email:</span> lienhe@nhasachtrithuc.vn
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
              className="rounded-lg shadow-sm"
            ></iframe>
          </div>
        </div>

        {/* Form liên hệ */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 bg-[#faf8f5] rounded-xl p-6"
        >
          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              Họ và tên
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b5e34]"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b5e34]"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              Tin nhắn
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b5e34]"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-[#8b5e34] text-white font-semibold py-2 rounded-lg hover:bg-[#c89f7b] transition"
          >
            Gửi liên hệ
          </button>
        </form>
      </div>
    </div>
  );
}

export default Contact;
