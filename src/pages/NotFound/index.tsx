import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <h1 className="text-9xl font-bold mb-4 text-red-500">404</h1>
      <p className="text-xl mb-8">Trang bạn đang tìm kiếm không tồn tại.</p>
      <button
        onClick={() => navigate("/")}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors duration-200"
      >
        Về trang chủ
      </button>
    </div>
  );
};

export default NotFound;
