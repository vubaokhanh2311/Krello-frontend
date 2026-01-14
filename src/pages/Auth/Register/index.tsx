import RegisterForm from "./RegisterForm";
import logo from "../../../assets/images/logo.png";

export default function index() {
  return (
    <div className="flex min-h-screen flex-col justify-center items-center bg-gray-50 px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 sm:px-6 lg:px-10 py-6 sm:py-8 shadow sm:rounded-lg">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center mb-4 sm:mb-6">
              <img
                src={logo}
                alt="Logo"
                className="w-32 h-32 sm:w-40 sm:h-40 lg:w-44 lg:h-44 object-contain"
              />
            </div>
          </div>
          <h2 className="text-3xl sm:text-3xl font-bold leading-7 sm:leading-9 tracking-tight text-gray-900 text-center mb-6">
            Đăng ký
          </h2>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
