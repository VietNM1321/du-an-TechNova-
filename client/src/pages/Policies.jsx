import React from "react";

function Policies() {
  return (
    <div className="p-6 bg-[#faf8f5] min-h-screen">
      <h1 className="text-3xl font-bold text-center text-[#8b5e34] mb-8">
        Chính sách bảo mật
      </h1>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 leading-relaxed">
        <p className="text-gray-700 mb-4">
          Chúng tôi cam kết bảo vệ quyền riêng tư và thông tin cá nhân của khách hàng. 
          Mọi dữ liệu bạn cung cấp sẽ được xử lý cẩn trọng và bảo mật tuyệt đối.
        </p>

        <h2 className="text-xl font-semibold text-[#8b5e34] mt-6 mb-3">
          1. Thu thập thông tin
        </h2>
        <p className="text-gray-700 mb-4">
          Chúng tôi chỉ thu thập thông tin cần thiết như họ tên, email, số điện thoại, 
          và địa chỉ giao hàng nhằm phục vụ cho việc mua bán và chăm sóc khách hàng.
        </p>

        <h2 className="text-xl font-semibold text-[#8b5e34] mt-6 mb-3">
          2. Sử dụng thông tin
        </h2>
        <p className="text-gray-700 mb-4">
          Thông tin cá nhân được sử dụng để xử lý đơn hàng, thông báo khuyến mãi, 
          hoặc hỗ trợ khách hàng khi cần thiết. Chúng tôi không chia sẻ thông tin của bạn cho bên thứ ba nếu không có sự đồng ý.
        </p>

        <h2 className="text-xl font-semibold text-[#8b5e34] mt-6 mb-3">
          3. Bảo mật thông tin
        </h2>
        <p className="text-gray-700 mb-4">
          Chúng tôi sử dụng các biện pháp kỹ thuật và an ninh cao để đảm bảo dữ liệu của bạn 
          không bị truy cập, thay đổi hoặc tiết lộ trái phép.
        </p>

        <h2 className="text-xl font-semibold text-[#8b5e34] mt-6 mb-3">
          4. Liên hệ
        </h2>
        <p className="text-gray-700">
          Nếu bạn có bất kỳ thắc mắc nào về chính sách bảo mật, vui lòng liên hệ qua email:{" "}
          <span className="text-[#8b5e34] font-medium">
            baomat@nhasachtrithuc.vn
          </span>
        </p>
      </div>
    </div>
  );
}

export default Policies;
