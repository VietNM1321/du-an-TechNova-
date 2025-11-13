import React from "react";

const colors = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"];

const ForgotPassword = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-lg text-center">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">Quên mật khẩu</h2>
        <p
          className="text-2xl font-extrabold animate-flicker"
          style={{
            animation: "flicker 1s infinite",
          }}
        >
          ✅ NGUUU!!!! quên ấn vào làm chó gì
        </p>
      </div>

      {/* Animation CSS */}
      <style>{`
        @keyframes flicker {
          0%, 100% { opacity: 1; color: ${colors[0]}; transform: translate(0,0) rotate(0deg);}
          10% { color: ${colors[1]}; transform: translate(-1px,1px) rotate(-1deg);}
          20% { color: ${colors[2]}; transform: translate(1px,-1px) rotate(1deg);}
          30% { color: ${colors[3]}; transform: translate(-1px,0px) rotate(0deg);}
          40% { color: ${colors[4]}; transform: translate(1px,1px) rotate(1deg);}
          50% { color: ${colors[5]}; transform: translate(0px,-1px) rotate(-1deg);}
          60% { color: ${colors[0]}; transform: translate(-1px,1px) rotate(0deg);}
          70% { color: ${colors[1]}; transform: translate(1px,0px) rotate(1deg);}
          80% { color: ${colors[2]}; transform: translate(0px,-1px) rotate(-1deg);}
          90% { color: ${colors[3]}; transform: translate(-1px,0px) rotate(0deg);}
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
