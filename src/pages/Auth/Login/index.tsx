import LoginForm from "./LoginForm";
export default function index() {
  return (
    <div className="flex min-h-screen flex-col justify-center items-center bg-gray-50 px-6 py-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-indigo-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 2C7 2 4 4 4 8s3 6 6 6 6-2 6-6-3-6-6-6z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Đăng nhập vào tài khoản của bạn
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-6 py-8 shadow sm:rounded-lg sm:px-10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

