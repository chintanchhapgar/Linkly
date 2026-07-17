import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { ArrowLeft, Loader2, Globe, Smartphone, Monitor } from 'lucide-react';
import { api } from '../lib/api';
import Navbar from '../components/Navbar';

const COLORS = ['#a855f7', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'];

export default function Analytics() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', id],
    queryFn: async () => (await api.get(`/api/analytics/${id}`)).data,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyber-bg text-white">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      </div>
    );
  }

  const dayData = Object.entries(data?.byDay || {}).map(([date, count]) => ({
    date: date.slice(5),
    clicks: count,
  }));

  const deviceData = Object.entries(data?.byDevice || {}).map(([name, value]) => ({
    name, value,
  }));

  const countryData = Object.entries(data?.byCountry || {})
    .map(([name, value]) => ({ name, value }))
    .slice(0, 10);

  const browserData = Object.entries(data?.byBrowser || {}).map(([name, value]) => ({
    name, value,
  }));

  return (
    <div className="min-h-screen bg-cyber-bg text-white relative">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none"></div>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8 relative">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold">Link Analytics</h1>
          <p className="text-slate-400 mt-1">
            Total clicks: <span className="font-bold gradient-text text-xl">{data?.totalClicks || 0}</span>
          </p>
        </div>

        {/* Daily Clicks */}
        <div className="bg-cyber-card border border-cyber-border p-6 rounded-xl mb-6">
          <h2 className="text-lg font-bold mb-4">Clicks Over Time</h2>
          {dayData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dayData}>
                <XAxis dataKey="date" stroke="#71717a" />
                <YAxis stroke="#71717a" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12121a',
                    border: '1px solid #27272f',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="clicks" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-center py-8">No clicks yet</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Devices */}
          <div className="bg-cyber-card border border-cyber-border p-6 rounded-xl">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-purple-400" /> Devices
            </h2>
            {deviceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={deviceData} dataKey="value" nameKey="name" outerRadius={80} label>
                    {deviceData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 text-center py-8">No data</p>
            )}
          </div>

          {/* Browsers */}
          <div className="bg-cyber-card border border-cyber-border p-6 rounded-xl">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-cyan-400" /> Browsers
            </h2>
            {browserData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={browserData} dataKey="value" nameKey="name" outerRadius={80} label>
                    {browserData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 text-center py-8">No data</p>
            )}
          </div>
        </div>

        {/* Countries */}
        <div className="bg-cyber-card border border-cyber-border p-6 rounded-xl">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-pink-400" /> Top Countries
          </h2>
          {countryData.length > 0 ? (
            <div className="space-y-2">
              {countryData.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-cyber-bg border border-cyber-border rounded-lg">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-slate-400">{c.value as number} clicks</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No location data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}