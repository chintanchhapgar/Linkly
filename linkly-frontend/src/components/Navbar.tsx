import { Link, useNavigate } from 'react-router-dom';
import { Link2, LogOut, User, CreditCard } from 'lucide-react';
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

        <div className="flex items-center gap-2">
          <Link
            to="/pricing"
            className="px-3 py-2 text-slate-300 hover:text-white text-sm font-medium hidden md:block"
          >
            Pricing
          </Link>
          <Link
            to="/billing"
            className="p-2 text-slate-400 hover:text-white hover:bg-cyber-hover rounded-lg transition"
            title="Billing"
          >
            <CreditCard className="w-5 h-5" />
          </Link>
          <Link
            to="/profile"
            className="flex items-center gap-2 px-3 py-2 hover:bg-cyber-hover rounded-lg transition"
          >
            <div className="w-8 h-8 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">
                {user?.name || user?.email?.split('@')[0]}
              </span>
              <span className="text-xs text-purple-400">{user?.plan}</span>
            </div>
          </Link>

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