import LoginForm from "./LoginForm";
export default function index() {
  return (
    <div className="flex min-h-screen flex-col justify-center items-center bg-gray-50 px-6 py-12">
      <div className=" sm:mx-auto sm:w-full sm:max-w-md ">
        <div className="bg-white px-6 py-8 shadow sm:rounded-lg sm:px-10">
          <div className="sm:mx-auto sm:w-full sm:max-w-md ">
            <div className="flex justify-center mb-2">
              <img
                src="./src/assets/images/logo.png"
                alt=""
                width={180}
                height={180}
              />
            </div>
          </div>
          <h2 className="text-3xl font-bold leading-9 tracking-tight text-gray-900 text-center">
            Đăng nhập
          </h2>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
