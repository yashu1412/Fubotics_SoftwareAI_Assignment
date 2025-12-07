import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <motion.header initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }} className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-purple-600 text-white font-bold">AI</span>
          <span className="text-white font-semibold">AI Chat App</span>
        </div>
        <nav className="flex items-center gap-4">
          {user && (
            <>
              <Link className="text-gray-300 hover:text-white" to="/">Groups</Link>
              <Link className="text-gray-300 hover:text-white" to="/ai">AI Chat</Link>
              <button
                onClick={logout}
                className="ml-2 px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-700 text-white"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </motion.header>
  );
}
