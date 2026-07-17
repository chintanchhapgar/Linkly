import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Lock, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';

export default function ProtectedLink() {
  const { code } = useParams();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError('');

    try {
      const { data } = await api.post(`/api/links/${code}/verify-password`, {
        password,
      });

      if (data.success) {
        toast.success('Access granted!');
        // Redirect to original URL
        window.location.href = data.originalUrl;
      }
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to verify password';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40"></div>
      <div className="absolute inset-0 radial-glow"></div>

      <div className="w-full max-w-md relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-2xl items-center justify-center shadow-lg shadow-purple-500/50 mb-4 animate-glow">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Protected Link</h1>
          <p className="text-slate-400">
            This link is password-protected
          </p>
        </div>

        {/* Card */}
        <div className="bg-cyber-card border border-cyber-border rounded-2xl p-8 shadow-2xl shadow-purple-500/10 backdrop-blur-xl">
          <div className="mb-6 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg flex items-start gap-2">
            <Lock className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-purple-300">
                Password Required
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Enter the password to access this link
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className={`w-full px-4 py-3 pr-11 bg-cyber-bg border rounded-lg focus:outline-none focus:ring-2 text-white placeholder-slate-500 transition ${
                    error
                      ? 'border-red-500/50 focus:ring-red-500'
                      : 'border-cyber-border focus:ring-purple-500'
                  }`}
                  placeholder="Enter password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {error && (
                <div className="mt-2 flex items-center gap-1.5 text-sm text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition btn-glow"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Unlock Link
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-cyber-border text-center">
            <p className="text-xs text-slate-500">
              Powered by{' '}
              <a href="/" className="text-purple-400 hover:text-purple-300 font-semibold">
                Linkly
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}