import { Link } from "react-router-dom";

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-gray-600 hover:text-gray-700 transition-colors"
          >
            WisataApp Diary
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-1 lg:py-2">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-gray-500">
          © 2024 WisataApp · Built with React + Vite
        </div>
      </footer>
    </div>
  );
}

export default Layout;
