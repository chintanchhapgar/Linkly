import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Link2, Plus, Copy, Trash2, BarChart3,
  Loader2, QrCode, Zap, Edit, Power, Clock, Search,
  Lock, Eye, EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../lib/api';
import Navbar from '../components/Navbar';
import EditLinkModal from '../components/EditLinkModal';
import LinkFilters from '../components/LinkFilters';
import type { StatusFilter, SortOption } from '../components/LinkFilters';
import { useDebounce } from '../hooks/useDebounce';
import { Sparkles } from 'lucide-react'; // Add Sparkles
import { useRealtimeDashboard } from '../hooks/useRealtime';
import LiveClickFeed from '../components/LiveClickFeed';

interface LinkData {
  id: string;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  title?: string;
  clicks: number;
  isActive: boolean;
  expiresAt?: string | null;
  hasPassword?: boolean;
  createdAt: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ✨ Add this line to enable real-time!
  useRealtimeDashboard();

  const [showQR, setShowQR] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<LinkData | null>(null);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  
  const [form, setForm] = useState({
    originalUrl: '',
    customCode: '',
    title: '',
    password: '',
  });

  const [isAiLoading, setIsAiLoading] = useState(false);

const handleAiMagic = async () => {
  if (!form.originalUrl) {
    toast.error("Paste a URL first!");
    return;
  }

  setIsAiLoading(true);
  try {
        const { data } = await api.post('/api/ai/generate', { url: form.originalUrl });
        setForm(prev => ({
          ...prev,
          title: data.title,
          customCode: data.slug
        }));
        toast.success("✨ Magic worked! Fields populated.");
      } catch (error) {
        toast.error("AI couldn't analyze this URL.");
      } finally {
        setIsAiLoading(false);
      }
    };

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const debouncedSearch = useDebounce(search, 400);

  // Fetch all links (unfiltered) - for total count
  const { data: allLinks = [] } = useQuery<LinkData[]>({
    queryKey: ['links', 'all'],
    queryFn: async () => (await api.get('/api/links')).data,
    refetchOnWindowFocus: true,
  });

  // Fetch filtered links
  const { data: links = [], isLoading } = useQuery<LinkData[]>({
    queryKey: ['links', debouncedSearch, status, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (status !== 'all') params.append('status', status);
      if (sortBy !== 'newest') params.append('sortBy', sortBy);

      return (await api.get(`/api/links?${params.toString()}`)).data;
    },
    refetchOnWindowFocus: true,
  });

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => (await api.get('/api/analytics')).data,
    refetchOnWindowFocus: true,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const payload: any = { originalUrl: data.originalUrl };
      if (data.customCode) payload.customCode = data.customCode;
      if (data.title) payload.title = data.title;
      if (data.password) payload.password = data.password;
      return (await api.post('/api/links', payload)).data;
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['links'] });
      await queryClient.refetchQueries({ queryKey: ['stats'] });
      setForm({ originalUrl: '', customCode: '', title: '', password: '' });
      toast.success('Link created!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to create link');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/api/links/${id}`),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['links'] });
      await queryClient.refetchQueries({ queryKey: ['stats'] });
      toast.success('Link deleted');
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const isExpired = (link: LinkData) => {
    return link.expiresAt && new Date(link.expiresAt) < new Date();
  };

  const hasActiveFilters = search !== '' || status !== 'all' || sortBy !== 'newest';

  return (
    <div className="min-h-screen bg-cyber-bg text-white relative">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none"></div>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8 relative">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage your shortened links</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            {
              icon: Link2,
              label: 'Total Links',
              value: stats?.totalLinks || 0,
              color: 'purple',
            },
            {
              icon: Zap,
              label: 'Total Clicks',
              value: stats?.totalClicks || 0,
              color: 'cyan',
            },
            {
              icon: BarChart3,
              label: 'Avg Clicks/Link',
              value: stats?.totalLinks
                ? Math.round(stats.totalClicks / stats.totalLinks)
                : 0,
              color: 'pink',
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-cyber-card border border-cyber-border p-6 rounded-xl hover:border-purple-500/30 transition"
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-10 h-10 rounded-lg bg-${stat.color}-500/10 border border-${stat.color}-500/30 flex items-center justify-center`}
                >
                  <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
              <div className="text-4xl font-bold gradient-text">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <LiveClickFeed />
        </div>

        {/* Create Link Form */}
        <div className="bg-cyber-card border border-cyber-border p-6 rounded-xl mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-400" />
              Create Short Link
            </h2>
            <button
              type="button"
              onClick={handleAiMagic}
              disabled={isAiLoading || !form.originalUrl}
              className="flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 disabled:opacity-50 transition bg-cyan-400/10 px-3 py-1.5 rounded-full border border-cyan-400/20"
            >
              {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              AI MAGIC
            </button>
          </div>
          
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate(form);
            }}
            className="space-y-3"
          >
            <input
              type="url"
              required
              placeholder="Paste your long URL here..."
              value={form.originalUrl}
              onChange={(e) => setForm({ ...form, originalUrl: e.target.value })}
              className="w-full px-4 py-3 bg-cyber-bg border border-cyber-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-500"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Custom slug (optional)"
                value={form.customCode}
                onChange={(e) => setForm({ ...form, customCode: e.target.value })}
                className="px-4 py-2.5 bg-cyber-bg border border-cyber-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-500"
              />
              <input
                type="text"
                placeholder="Title (optional)"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="px-4 py-2.5 bg-cyber-bg border border-cyber-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-500"
              />
            </div>
            {/* Password Protection (Optional) */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showCreatePassword ? 'text' : 'password'}
                placeholder="Password protection (optional)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-10 pr-11 py-2.5 bg-cyber-bg border border-cyber-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-500"
              />
              {form.password && (
                <button
                  type="button"
                  onClick={() => setShowCreatePassword(!showCreatePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showCreatePassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition btn-glow"
            >
              {createMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Shorten URL
            </button>
          </form>
        </div>

        {/* Search & Filters */}
        <LinkFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalCount={allLinks.length}
          filteredCount={links.length}
        />

        {/* Links List */}
        <div className="bg-cyber-card border border-cyber-border rounded-xl">
          <div className="p-6 border-b border-cyber-border flex items-center justify-between">
            <h2 className="text-lg font-bold">
              {hasActiveFilters ? 'Filtered Results' : 'Your Links'}
            </h2>
            <div className="text-sm text-slate-400">
              {links.length} {links.length === 1 ? 'link' : 'links'}
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
            </div>
          ) : links.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              {hasActiveFilters ? (
                <>
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium text-white">No matches found</p>
                  <p className="text-sm mt-1">Try adjusting your filters</p>
                </>
              ) : (
                <>
                  <Link2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No links yet. Create your first short link above!</p>
                </>
              )}
            </div>
          ) : (
            <div className="divide-y divide-cyber-border">
              {links.map((link) => (
                <div
                  key={link.id}
                  className={`p-4 hover:bg-cyber-hover transition ${
                    !link.isActive || isExpired(link) ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {link.title && (
                          <div className="font-medium text-white truncate">
                            {highlightMatch(link.title, debouncedSearch)}
                          </div>
                        )}
                        {!link.isActive && (
                          <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 text-red-400 text-xs rounded font-medium flex items-center gap-1">
                            <Power className="w-3 h-3" />
                            Disabled
                          </span>
                        )}
                        {isExpired(link) && (
                          <span className="px-2 py-0.5 bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs rounded font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expired
                          </span>
                        )}
                        {link.hasPassword && (
                          <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs rounded font-medium flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Protected
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <a
                          href={link.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 font-medium hover:text-cyan-300 font-mono"
                        >
                          {link.shortUrl}
                        </a>
                        <button
                          onClick={() => copyToClipboard(link.shortUrl)}
                          className="text-slate-500 hover:text-purple-400 transition"
                          title="Copy"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-sm text-slate-500 truncate mt-0.5">
                        → {highlightMatch(link.originalUrl, debouncedSearch)}
                      </div>
                      {link.expiresAt && (
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expires: {new Date(link.expiresAt).toLocaleString()}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-center px-4">
                        <div className="text-2xl font-bold gradient-text">
                          {link.clicks}
                        </div>
                        <div className="text-xs text-slate-500">clicks</div>
                      </div>

                      <button
                        onClick={() => setEditingLink(link)}
                        className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-cyber-hover rounded-lg transition"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() =>
                          setShowQR(showQR === link.id ? null : link.id)
                        }
                        className="p-2 text-slate-400 hover:text-purple-400 hover:bg-cyber-hover rounded-lg transition"
                        title="QR Code"
                      >
                        <QrCode className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => navigate(`/analytics/${link.id}`)}
                        className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyber-hover rounded-lg transition"
                        title="Analytics"
                      >
                        <BarChart3 className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('Delete this link?')) {
                            deleteMutation.mutate(link.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {showQR === link.id && (
                    <div className="mt-4 p-4 bg-white rounded-lg flex justify-center">
                      <QRCodeSVG value={link.shortUrl} size={180} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editingLink && (
        <EditLinkModal
          link={editingLink}
          onClose={() => setEditingLink(null)}
        />
      )}
    </div>
  );
}

// Highlight matching text in search results
function highlightMatch(text: string, search: string) {
  if (!search || !text) return text;

  const regex = new RegExp(
    `(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    'gi'
  );
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-purple-500/30 text-purple-200 px-0.5 rounded"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}