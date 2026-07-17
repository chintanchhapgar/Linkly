import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User, Mail, Calendar, Link2, Zap, Award,
  Loader2, Save, KeyRound, Trash2, Eye, EyeOff,
  AlertTriangle, Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import Navbar from '../components/Navbar';

interface Profile {
  id: string;
  email: string;
  name?: string;
  plan: string;
  createdAt: string;
  totalLinks: number;
  totalClicks: number;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, setAuth, logout } = useAuth();

  // Profile form
  const [nameForm, setNameForm] = useState({ name: '' });
  const [isEditingName, setIsEditingName] = useState(false);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete form
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePwd, setShowDeletePwd] = useState(false);

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => (await api.get('/api/user/me')).data,
  });

  // Update name mutation
  const updateNameMutation = useMutation({
    mutationFn: async () => {
      return (await api.put('/api/user/me', { name: nameForm.name })).data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      // Update auth store
      if (user) {
        setAuth({ ...user, name: data.name }, localStorage.getItem('token')!);
      }
      toast.success('Name updated successfully!');
      setIsEditingName(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to update');
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      return (
        await api.put('/api/user/me/password', {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        })
      ).data;
    },
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsChangingPassword(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to change password');
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      return (
        await api.delete('/api/user/me', {
          data: { password: deletePassword },
        })
      ).data;
    },
    onSuccess: () => {
      toast.success('Account deleted');
      logout();
      navigate('/');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to delete account');
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    changePasswordMutation.mutate();
  };

  const startEditingName = () => {
    setNameForm({ name: profile?.name || '' });
    setIsEditingName(true);
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-cyber-bg text-white">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      </div>
    );
  }

  const memberSince = new Date(profile.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-cyber-bg text-white relative">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none"></div>
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-8 relative">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Profile Settings</h1>
          <p className="text-slate-400 mt-1">Manage your account and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-cyber-card border border-cyber-border rounded-xl p-8 mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50">
              <User className="w-12 h-12 text-white" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={nameForm.name}
                    onChange={(e) => setNameForm({ name: e.target.value })}
                    className="w-full px-4 py-2 bg-cyber-bg border border-cyber-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white text-xl font-bold"
                    placeholder="Your name"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateNameMutation.mutate()}
                      disabled={updateNameMutation.isPending}
                      className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 text-sm"
                    >
                      {updateNameMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="px-4 py-1.5 bg-cyber-hover border border-cyber-border text-white rounded-lg font-medium hover:bg-cyber-border text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">
                      {profile.name || 'Anonymous User'}
                    </h2>
                    <button
                      onClick={startEditingName}
                      className="text-sm text-purple-400 hover:text-purple-300 font-medium"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 mt-1">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                    <Calendar className="w-4 h-4" />
                    Member since {memberSince}
                  </div>
                </div>
              )}
            </div>

            {/* Plan Badge */}
            <div className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-purple-300">{profile.plan}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">Current Plan</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-cyber-card border border-cyber-border p-6 rounded-xl">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Link2 className="w-4 h-4" />
              <span className="text-sm">Total Links</span>
            </div>
            <div className="text-3xl font-bold gradient-text">
              {profile.totalLinks}
            </div>
          </div>
          <div className="bg-cyber-card border border-cyber-border p-6 rounded-xl">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Zap className="w-4 h-4" />
              <span className="text-sm">Total Clicks</span>
            </div>
            <div className="text-3xl font-bold gradient-text">
              {profile.totalClicks}
            </div>
          </div>
          <div className="bg-cyber-card border border-cyber-border p-6 rounded-xl col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Award className="w-4 h-4" />
              <span className="text-sm">Avg Clicks/Link</span>
            </div>
            <div className="text-3xl font-bold gradient-text">
              {profile.totalLinks > 0
                ? Math.round(profile.totalClicks / profile.totalLinks)
                : 0}
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Password</h2>
                <p className="text-sm text-slate-400">
                  Update your account password
                </p>
              </div>
            </div>
            {!isChangingPassword && (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="px-4 py-2 bg-cyber-hover border border-cyber-border text-white rounded-lg font-medium hover:bg-cyber-border text-sm"
              >
                Change Password
              </button>
            )}
          </div>

          {isChangingPassword && (
            <form onSubmit={handlePasswordSubmit} className="space-y-3 mt-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 pr-11 bg-cyber-bg border border-cyber-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword({ ...showPassword, current: !showPassword.current })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showPassword.current ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 pr-11 bg-cyber-bg border border-cyber-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword({ ...showPassword, new: !showPassword.new })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showPassword.new ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2.5 pr-11 bg-cyber-bg border rounded-lg focus:outline-none focus:ring-2 text-white ${
                      passwordForm.confirmPassword &&
                      passwordForm.newPassword !== passwordForm.confirmPassword
                        ? 'border-red-500/50 focus:ring-red-500'
                        : 'border-cyber-border focus:ring-purple-500'
                    }`}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword({
                        ...showPassword,
                        confirm: !showPassword.confirm,
                      })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showPassword.confirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {passwordForm.confirmPassword &&
                  passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p className="text-xs text-red-400 mt-1">
                      Passwords do not match
                    </p>
                  )}
                {passwordForm.confirmPassword &&
                  passwordForm.newPassword === passwordForm.confirmPassword &&
                  passwordForm.newPassword.length >= 6 && (
                    <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Passwords match
                    </p>
                  )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                  className="px-4 py-2 bg-cyber-hover border border-cyber-border text-white rounded-lg font-medium hover:bg-cyber-border text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  {changePasswordMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Update Password
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-red-500/5 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-400">Danger Zone</h2>
              <p className="text-sm text-slate-400">
                Irreversible and destructive actions
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-cyber-card border border-cyber-border rounded-lg">
            <div>
              <div className="font-medium">Delete Account</div>
              <div className="text-sm text-slate-400 mt-0.5">
                Permanently delete your account and all your links
              </div>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg font-medium hover:bg-red-500/30 flex items-center gap-2 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-cyber-card border border-red-500/30 rounded-2xl w-full max-w-md shadow-2xl shadow-red-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-cyber-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-400">Delete Account?</h2>
                  <p className="text-sm text-slate-400 mt-0.5">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300">
                ⚠️ This will permanently delete:
                <ul className="mt-2 space-y-1 list-disc list-inside text-slate-400">
                  <li>Your account and profile</li>
                  <li>All {profile.totalLinks} of your links</li>
                  <li>All click analytics ({profile.totalClicks} clicks)</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Enter your password to confirm
                </label>
                <div className="relative">
                  <input
                    type={showDeletePwd ? 'text' : 'password'}
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-11 bg-cyber-bg border border-cyber-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePwd(!showDeletePwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showDeletePwd ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                  }}
                  className="flex-1 py-2.5 bg-cyber-hover border border-cyber-border text-white rounded-lg font-medium hover:bg-cyber-border"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteAccountMutation.mutate()}
                  disabled={!deletePassword || deleteAccountMutation.isPending}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleteAccountMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}