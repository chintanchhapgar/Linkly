import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2, Save, Power, Link2, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';

interface LinkData {
  id: string;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  title?: string;
  isActive: boolean;
  expiresAt?: string | null;
  hasPassword?: boolean;
}

interface Props {
  link: LinkData;
  onClose: () => void;
}

// Helper: Convert ISO date to datetime-local format
function toDatetimeLocal(isoString: string | null | undefined): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().slice(0, 16);
}

// Helper: Convert datetime-local to ISO string
function fromDatetimeLocal(localString: string): string {
  return new Date(localString).toISOString();
}

export default function EditLinkModal({ link, onClose }: Props) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    originalUrl: link.originalUrl,
    title: link.title || '',
    expiresAt: toDatetimeLocal(link.expiresAt),
    isActive: link.isActive,
  });

  const [hasExpiration, setHasExpiration] = useState(!!link.expiresAt);

  // Password states
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        originalUrl: form.originalUrl,
        title: form.title || null,
        isActive: form.isActive,
      };

      if (hasExpiration && form.expiresAt) {
        payload.expiresAt = fromDatetimeLocal(form.expiresAt);
      } else {
        payload.expiresAt = null;
      }

      // Handle password
      if (changePassword) {
        payload.password = password || null; // Empty = remove password
      }

      console.log('📤 Sending:', payload);
      return (await api.put(`/api/links/${link.id}`, payload)).data;
    },
    onSuccess: async (data) => {
      console.log('✅ Received:', data);
      await queryClient.refetchQueries({ queryKey: ['links'] });
      await queryClient.refetchQueries({ queryKey: ['stats'] });
      toast.success('Link updated successfully!');
      onClose();
    },
    onError: (err: any) => {
      console.error('❌ Error:', err.response?.data);
      toast.error(err.response?.data?.error || 'Failed to update');
    },
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const now = new Date();
  const nowOffset = now.getTimezoneOffset() * 60000;
  const minDateTime = new Date(now.getTime() - nowOffset).toISOString().slice(0, 16);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-cyber-card border border-cyber-border rounded-2xl w-full max-w-lg shadow-2xl shadow-purple-500/20 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cyber-border sticky top-0 bg-cyber-card z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Edit Link</h2>
              <p className="text-xs text-slate-400 font-mono">/{link.shortCode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-cyber-hover rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateMutation.mutate();
          }}
          className="p-6 space-y-5"
        >
          {/* Original URL */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Destination URL
            </label>
            <input
              type="url"
              required
              value={form.originalUrl}
              onChange={(e) => setForm({ ...form, originalUrl: e.target.value })}
              className="w-full px-4 py-2.5 bg-cyber-bg border border-cyber-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-500"
              placeholder="https://example.com"
            />
            <p className="text-xs text-slate-500 mt-1">
              Where should the short link redirect to?
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Title (optional)
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-cyber-bg border border-cyber-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-500"
              placeholder="My awesome link"
            />
          </div>

          {/* Expiration */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">
                Expiration Date
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasExpiration}
                  onChange={(e) => {
                    setHasExpiration(e.target.checked);
                    if (!e.target.checked) {
                      setForm({ ...form, expiresAt: '' });
                    } else if (!form.expiresAt) {
                      const oneHourLater = new Date(Date.now() + 60 * 60 * 1000);
                      const offset = oneHourLater.getTimezoneOffset() * 60000;
                      const local = new Date(oneHourLater.getTime() - offset)
                        .toISOString()
                        .slice(0, 16);
                      setForm({ ...form, expiresAt: local });
                    }
                  }}
                  className="w-4 h-4 rounded accent-purple-500"
                />
                <span className="text-xs text-slate-400">Enable</span>
              </label>
            </div>
            {hasExpiration && (
              <>
                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  min={minDateTime}
                  className="w-full px-4 py-2.5 bg-cyber-bg border border-cyber-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                />
                {form.expiresAt && (
                  <p className="text-xs text-purple-400 mt-2">
                    ⏰ Expires: {new Date(form.expiresAt).toLocaleString()}
                  </p>
                )}
              </>
            )}
            <p className="text-xs text-slate-500 mt-1">
              {hasExpiration
                ? 'Link will stop working after this date'
                : 'Link never expires'}
            </p>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-cyber-bg border border-cyber-border rounded-lg">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
                  form.isActive
                    ? 'bg-green-500/20 border border-green-500/30'
                    : 'bg-red-500/20 border border-red-500/30'
                }`}
              >
                <Power
                  className={`w-5 h-5 ${
                    form.isActive ? 'text-green-400' : 'text-red-400'
                  }`}
                />
              </div>
              <div>
                <div className="font-medium">
                  {form.isActive ? 'Active' : 'Disabled'}
                </div>
                <div className="text-xs text-slate-400">
                  {form.isActive
                    ? 'Link redirects normally'
                    : 'Link will show 410 error'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, isActive: !form.isActive })}
              className={`relative w-12 h-6 rounded-full transition ${
                form.isActive ? 'bg-green-500' : 'bg-slate-600'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${
                  form.isActive ? 'left-6' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Password Protection */}
          <div className="p-4 bg-cyber-bg border border-cyber-border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    link.hasPassword
                      ? 'bg-purple-500/20 border border-purple-500/30'
                      : 'bg-slate-500/10 border border-slate-500/30'
                  }`}
                >
                  <Lock
                    className={`w-5 h-5 ${
                      link.hasPassword ? 'text-purple-400' : 'text-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <div className="font-medium">Password Protection</div>
                  <div className="text-xs text-slate-400">
                    {link.hasPassword ? '🔒 Currently protected' : 'No password set'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setChangePassword(!changePassword);
                  if (changePassword) setPassword('');
                }}
                className="text-sm text-purple-400 hover:text-purple-300 font-medium"
              >
                {changePassword ? 'Cancel' : link.hasPassword ? 'Change' : 'Add'}
              </button>
            </div>

            {changePassword && (
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-11 bg-cyber-card border border-cyber-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-500"
                    placeholder={
                      link.hasPassword
                        ? 'Enter new password (leave empty to remove)'
                        : 'Enter password'
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {link.hasPassword
                    ? '💡 Leave empty and save to remove password'
                    : '💡 Users will need this password to access the link'}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-cyber-hover border border-cyber-border text-white rounded-lg font-semibold hover:bg-cyber-border transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition btn-glow"
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}