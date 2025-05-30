import { Link } from "react-router-dom";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            to="/"
            className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
          >
            WisataApp Diary
          </Link>
        </div>
      </header>

      <main>{children}</main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-center text-gray-500 text-sm">
            © 2024 WisataApp. Built with React + Vite
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
