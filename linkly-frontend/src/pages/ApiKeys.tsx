import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Key, Plus, Copy, Trash2, Power, Loader2, Check,
  AlertCircle,  Code2, Book,  Shield,
  Terminal, Activity, ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import Navbar from '../components/Navbar';

interface ApiKey {
  id: string;
  name: string;
  isActive: boolean;
  lastUsed: string | null;
  usageCount: number;
  createdAt: string;
}

export default function ApiKeysPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  const { data: keys = [], isLoading } = useQuery<ApiKey[]>({
    queryKey: ['api-keys'],
    queryFn: async () => (await api.get('/api/keys')).data,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return (await api.post('/api/keys', { name: newKeyName })).data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setCreatedKey(data.key);
      setNewKeyName('');
      toast.success('API key created!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to create key');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/api/keys/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API key revoked');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => await api.patch(`/api/keys/${id}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('Status updated');
    },
  });

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const closeCreatedKeyModal = () => {
    setCreatedKey(null);
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-white relative">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none"></div>
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Key className="w-10 h-10 text-purple-400" />
              API Keys
            </h1>
            <p className="text-slate-400 mt-1">
              Programmatically create and manage short links
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDocs(!showDocs)}
              className="px-4 py-2 bg-cyber-card border border-cyber-border text-white rounded-lg font-medium hover:bg-cyber-hover flex items-center gap-2"
            >
              <Book className="w-4 h-4" />
              {showDocs ? 'Hide' : 'Show'} Docs
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 flex items-center gap-2 btn-glow"
            >
              <Plus className="w-4 h-4" />
              Create Key
            </button>
          </div>
        </div>

        {/* API Documentation */}
        {showDocs && <ApiDocs />}

        {/* Info Card */}
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-purple-300 mb-1">Security Best Practices</div>
            <ul className="text-slate-400 space-y-1 list-disc list-inside">
              <li>Keep your API keys secret and never commit them to git</li>
              <li>Use environment variables in your applications</li>
              <li>Rotate keys periodically for enhanced security</li>
              <li>Revoke unused keys immediately</li>
            </ul>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-cyber-card border border-cyber-border p-4 rounded-xl">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Key className="w-4 h-4" />
              Total Keys
            </div>
            <div className="text-2xl font-bold gradient-text">{keys.length} / 5</div>
          </div>
          <div className="bg-cyber-card border border-cyber-border p-4 rounded-xl">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Power className="w-4 h-4" />
              Active Keys
            </div>
            <div className="text-2xl font-bold gradient-text">
              {keys.filter((k) => k.isActive).length}
            </div>
          </div>
          <div className="bg-cyber-card border border-cyber-border p-4 rounded-xl">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Activity className="w-4 h-4" />
              Total API Calls
            </div>
            <div className="text-2xl font-bold gradient-text">
              {keys.reduce((sum, k) => sum + k.usageCount, 0)}
            </div>
          </div>
        </div>

        {/* Keys List */}
        <div className="bg-cyber-card border border-cyber-border rounded-xl">
          <div className="p-6 border-b border-cyber-border">
            <h2 className="text-lg font-bold">Your API Keys</h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
            </div>
          ) : keys.length === 0 ? (
            <div className="p-12 text-center">
              <Key className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
              <p className="text-slate-400 mb-4">No API keys yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Your First Key
              </button>
            </div>
          ) : (
            <div className="divide-y divide-cyber-border">
              {keys.map((key) => (
                <div
                  key={key.id}
                  className={`p-4 hover:bg-cyber-hover transition ${
                    !key.isActive ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
                          <Key className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="font-medium">{key.name}</div>
                        {!key.isActive && (
                          <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 text-red-400 text-xs rounded font-medium">
                            Disabled
                          </span>
                        )}
                      </div>
                      <div className="mt-1 ml-10 text-sm text-slate-500 font-mono">
                        lk_live_••••••••••••••••••••••••••••
                      </div>
                      <div className="mt-2 ml-10 flex flex-wrap gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {key.usageCount} calls
                        </span>
                        <span>
                          Created: {new Date(key.createdAt).toLocaleDateString()}
                        </span>
                        {key.lastUsed && (
                          <span>
                            Last used: {new Date(key.lastUsed).toLocaleString()}
                          </span>
                        )}
                        {!key.lastUsed && <span>Never used</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleMutation.mutate(key.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          key.isActive
                            ? 'bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30'
                            : 'bg-slate-500/20 border border-slate-500/30 text-slate-400 hover:bg-slate-500/30'
                        }`}
                        title={key.isActive ? 'Disable' : 'Enable'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Revoke "${key.name}"? This cannot be undone.`)) {
                            deleteMutation.mutate(key.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                        title="Revoke"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && !createdKey && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-cyber-card border border-cyber-border rounded-2xl w-full max-w-md shadow-2xl shadow-purple-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-cyber-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Create API Key</h2>
                  <p className="text-sm text-slate-400">
                    Give your key a memorable name
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate();
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Key Name
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production Server, Mobile App"
                  autoFocus
                  className="w-full px-4 py-2.5 bg-cyber-bg border border-cyber-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Use a descriptive name to identify this key later
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-cyber-hover border border-cyber-border text-white rounded-lg font-medium hover:bg-cyber-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !newKeyName}
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Key className="w-4 h-4" />
                  )}
                  Generate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Created Key Modal - Show ONCE */}
      {createdKey && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <div className="bg-cyber-card border border-purple-500/30 rounded-2xl w-full max-w-lg shadow-2xl shadow-purple-500/30 animate-glow">
            <div className="p-6 border-b border-cyber-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">API Key Created!</h2>
                  <p className="text-sm text-slate-400">
                    Save this key now - you won't see it again
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-200">
                  <div className="font-medium mb-1">Important!</div>
                  <p className="text-yellow-300/80">
                    This is the only time you'll see this API key. Copy it now and
                    store it securely.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Your API Key
                </label>
                <div className="relative">
                  <div className="p-4 bg-cyber-bg border border-cyber-border rounded-lg font-mono text-sm text-cyan-400 break-all pr-14">
                    {createdKey}
                  </div>
                  <button
                    onClick={() => copyKey(createdKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-500/30 transition"
                  >
                    {copiedKey ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-cyber-bg border border-cyber-border rounded-lg text-xs font-mono text-slate-400">
                <div className="text-slate-500 mb-1"># Example usage:</div>
                <div>
                  curl -X POST {import.meta.env.VITE_API_URL}/api/public/shorten \
                </div>
                <div>&nbsp;&nbsp;-H "x-api-key: {createdKey.slice(0, 20)}..." \</div>
                <div>&nbsp;&nbsp;-H "Content-Type: application/json" \</div>
                <div>&nbsp;&nbsp;-d '&#123;"url": "https://example.com"&#125;'</div>
              </div>

              <button
                onClick={closeCreatedKeyModal}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-lg font-semibold hover:opacity-90 transition"
              >
                I've Saved My Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// API Documentation Component
function ApiDocs() {
  const [copied, setCopied] = useState<string | null>(null);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    toast.success('Copied!');
    setTimeout(() => setCopied(null), 2000);
  };

  const endpoints = [
    {
      id: 'shorten',
      method: 'POST',
      path: '/api/public/shorten',
      title: 'Create Short Link',
      description: 'Create a new shortened URL',
      request: `curl -X POST ${apiUrl}/api/public/shorten \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com/very/long/url",
    "customCode": "my-link",
    "title": "My Link"
  }'`,
      response: `{
  "id": "clxxx...",
  "shortCode": "abc1234",
  "shortUrl": "${apiUrl}/abc1234",
  "originalUrl": "https://example.com/...",
  "title": "My Link",
  "createdAt": "2026-07-17T..."
}`,
    },
    {
      id: 'list',
      method: 'GET',
      path: '/api/public/links',
      title: 'List Links',
      description: 'Get all your shortened links (last 100)',
      request: `curl ${apiUrl}/api/public/links \\
  -H "x-api-key: YOUR_API_KEY"`,
      response: `[
  {
    "id": "clxxx...",
    "shortCode": "abc1234",
    "shortUrl": "${apiUrl}/abc1234",
    "originalUrl": "https://example.com",
    "clicks": 42,
    "createdAt": "..."
  }
]`,
    },
    {
      id: 'get',
      method: 'GET',
      path: '/api/public/links/:code',
      title: 'Get Single Link',
      description: 'Get details of a specific link',
      request: `curl ${apiUrl}/api/public/links/abc1234 \\
  -H "x-api-key: YOUR_API_KEY"`,
      response: `{
  "id": "clxxx...",
  "shortCode": "abc1234",
  "shortUrl": "${apiUrl}/abc1234",
  "originalUrl": "https://example.com",
  "title": "My Link",
  "clicks": 42,
  "isActive": true
}`,
    },
    {
      id: 'delete',
      method: 'DELETE',
      path: '/api/public/links/:code',
      title: 'Delete Link',
      description: 'Delete a shortened link',
      request: `curl -X DELETE ${apiUrl}/api/public/links/abc1234 \\
  -H "x-api-key: YOUR_API_KEY"`,
      response: `{ "success": true }`,
    },
    {
      id: 'me',
      method: 'GET',
      path: '/api/public/me',
      title: 'Get Account Info',
      description: 'Get your account details and usage',
      request: `curl ${apiUrl}/api/public/me \\
  -H "x-api-key: YOUR_API_KEY"`,
      response: `{
  "id": "clxxx...",
  "email": "you@example.com",
  "plan": "PRO",
  "linksUsed": 42,
  "linksLimit": 5000
}`,
    },
  ];

  const methodColors: Record<string, string> = {
    GET: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    POST: 'bg-green-500/20 border-green-500/30 text-green-400',
    DELETE: 'bg-red-500/20 border-red-500/30 text-red-400',
    PATCH: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
  };

  return (
    <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center">
          <Code2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">API Documentation</h2>
          <p className="text-sm text-slate-400">RESTful API for programmatic access</p>
        </div>
      </div>

      {/* Authentication */}
      <div className="mb-6 p-4 bg-cyber-bg border border-cyber-border rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-purple-400" />
          <h3 className="font-semibold">Authentication</h3>
        </div>
        <p className="text-sm text-slate-400 mb-3">
          Include your API key in the <code className="text-cyan-400 bg-cyber-hover px-1 rounded">x-api-key</code> header
        </p>
        <div className="bg-black/40 border border-cyber-border rounded p-3 font-mono text-sm text-cyan-400">
          x-api-key: lk_live_xxxxxxxxxxxxxxxxxxxxxxxxx
        </div>
      </div>

      {/* Base URL */}
      <div className="mb-6 p-4 bg-cyber-bg border border-cyber-border rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <ExternalLink className="w-4 h-4 text-cyan-400" />
          <h3 className="font-semibold">Base URL</h3>
        </div>
        <div className="bg-black/40 border border-cyber-border rounded p-3 font-mono text-sm text-cyan-400">
          {apiUrl}
        </div>
      </div>

      {/* Endpoints */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Terminal className="w-5 h-5 text-purple-400" />
          Endpoints
        </h3>

        {endpoints.map((endpoint) => (
          <div
            key={endpoint.id}
            className="border border-cyber-border rounded-lg overflow-hidden"
          >
            <div className="p-4 bg-cyber-bg border-b border-cyber-border">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-bold border ${
                    methodColors[endpoint.method]
                  }`}
                >
                  {endpoint.method}
                </span>
                <code className="text-cyan-400 font-mono text-sm">
                  {endpoint.path}
                </code>
              </div>
              <h4 className="font-semibold">{endpoint.title}</h4>
              <p className="text-sm text-slate-400">{endpoint.description}</p>
            </div>

            <div className="p-4 space-y-3">
              {/* Request */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase">
                    Request
                  </span>
                  <button
                    onClick={() => copyCode(endpoint.request, `req-${endpoint.id}`)}
                    className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    {copied === `req-${endpoint.id}` ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    Copy
                  </button>
                </div>
                <pre className="bg-black/40 border border-cyber-border rounded p-3 text-xs text-slate-300 overflow-x-auto font-mono">
                  {endpoint.request}
                </pre>
              </div>

              {/* Response */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase">
                    Response
                  </span>
                  <button
                    onClick={() => copyCode(endpoint.response, `res-${endpoint.id}`)}
                    className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    {copied === `res-${endpoint.id}` ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    Copy
                  </button>
                </div>
                <pre className="bg-black/40 border border-cyber-border rounded p-3 text-xs text-green-400 overflow-x-auto font-mono">
                  {endpoint.response}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Error Codes */}
      <div className="mt-6 p-4 bg-cyber-bg border border-cyber-border rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <h3 className="font-semibold">Error Codes</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between border-b border-cyber-border pb-2">
            <code className="text-cyan-400">401</code>
            <span className="text-slate-400">Invalid or missing API key</span>
          </div>
          <div className="flex justify-between border-b border-cyber-border pb-2">
            <code className="text-cyan-400">403</code>
            <span className="text-slate-400">Plan limit reached or forbidden</span>
          </div>
          <div className="flex justify-between border-b border-cyber-border pb-2">
            <code className="text-cyan-400">404</code>
            <span className="text-slate-400">Resource not found</span>
          </div>
          <div className="flex justify-between">
            <code className="text-cyan-400">400</code>
            <span className="text-slate-400">Invalid request data</span>
          </div>
        </div>
      </div>
    </div>
  );
}