import React from "react";

function About() {
  return (
    <div className="p-6 bg-[#faf8f5] min-h-screen">
      {/* Tiêu đề */}
      <h1 className="text-3xl font-bold text-center text-[#8b5e34] mb-8">
        Giới thiệu về chúng tôi
      </h1>

      {/* Nội dung */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 leading-relaxed">
        <p className="text-gray-700 mb-5">
          Chào mừng bạn đến với <span className="font-semibold text-[#8b5e34]">Nhà Sách Tri Thức</span> – 
          nơi mang đến những cuốn sách hay và giá trị nhất, góp phần lan tỏa tri thức đến mọi người.
        </p>

        <p className="text-gray-700 mb-5">
          Chúng tôi không chỉ đơn thuần là một cửa hàng bán sách, mà còn là nơi chia sẻ niềm đam mê đọc sách, 
          là cầu nối giữa tác giả và độc giả, giữa tri thức và cuộc sống.
        </p>

        <p className="text-gray-700 mb-5">
          Với sứ mệnh “Lan tỏa tri thức – Nâng tầm giá trị con người”, 
          chúng tôi luôn nỗ lực mang đến trải nghiệm mua sắm tiện lợi, 
          thân thiện và đáng tin cậy nhất cho khách hàng.
        </p>

        <p className="text-gray-700">
          Hãy cùng chúng tôi khám phá thế giới qua từng trang sách – 
          nơi bạn có thể tìm thấy cảm hứng, tri thức và những giá trị sống sâu sắc.
        </p>

        {/* Thông tin liên hệ */}
        <div className="mt-10 text-center">
          <h2 className="text-2xl font-semibold text-[#8b5e34] mb-3">Liên hệ</h2>
          <p>Email: <span className="text-gray-800">lienhe@nhasachtrithuc.vn</span></p>
          <p>Hotline: <span className="text-gray-800">0123 456 789</span></p>
          <p>Địa chỉ: 123 Đường Sách,Hà Nội</p>
        </div>
      </div>
    </div>
  );
}

export default About;