import { Link, useNavigate } from 'react-router-dom';
import { Link2, LogOut, User } from 'lucide-react';
import { useAuth } from '../store/auth';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="border-b border-cyber-border bg-cyber-bg/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/50">
            <Link2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">Linkly</span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <div className="w-8 h-8 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-purple-400" />
            </div>
            <span className="font-medium">{user?.name || user?.email}</span>
            <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-purple-300 text-xs rounded font-semibold">
              {user?.plan}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-white hover:bg-cyber-hover rounded-lg transition"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}