import "./App.css";

function App() {
  return (
    <>
      <nav className="bg-white shadow-md">
        <div className="container mx-auto flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <div className="text-2xl font-bold text-blue-600">MyWebsite</div>

          {/* Navigation Links */}
          <ul className="flex space-x-6">
            <li>
              <a
                href="#"
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                Services
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                Contact
              </a>
            </li>
          </ul>

          {/* Action Button */}
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors duration-200">
            Login
          </button>
        </div>
      </nav>
    </>
  );
}

export default App;
