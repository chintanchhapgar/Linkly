import { useEffect, useState } from 'react';
import { Zap, Globe, Smartphone, Monitor } from 'lucide-react';
import { getSocket } from '../lib/socket';
import { useAuth } from '../store/auth';

interface ClickEvent {
  linkId: string;
  shortCode: string;
  totalClicks: number;
  country: string;
  city: string;
  device: string;
  browser: string;
  timestamp: string;
}

export default function LiveClickFeed() {
  const { user } = useAuth();
  const [clicks, setClicks] = useState<ClickEvent[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    const socket = getSocket();
    socket.emit('join-user-room', user.id);

    const handleClick = (data: ClickEvent) => {
      setClicks(prev => [data, ...prev].slice(0, 10)); // Keep last 10
    };

    socket.on('new-click', handleClick);

    return () => {
      socket.off('new-click', handleClick);
    };
  }, [user?.id]);

  if (clicks.length === 0) {
    return (
      <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-slate-400 font-mono">WAITING FOR CLICKS</span>
        </div>
        <p className="text-sm text-slate-500">
          Click a short link to see it appear here in real-time!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-cyber-card border border-cyber-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="font-bold flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Live Click Feed
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {clicks.length} recent
        </span>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {clicks.map((click, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 bg-cyber-bg border border-cyber-border rounded-lg animate-in fade-in slide-in-from-top-2 duration-500"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm text-cyan-400 truncate">
                  /{click.shortCode}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {click.country}
                  </span>
                  <span className="flex items-center gap-1">
                    {click.device === 'mobile' ? (
                      <Smartphone className="w-3 h-3" />
                    ) : (
                      <Monitor className="w-3 h-3" />
                    )}
                    {click.device}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right ml-2">
              <div className="text-xs text-slate-400">
                {new Date(click.timestamp).toLocaleTimeString()}
              </div>
              <div className="text-xs text-green-400 font-mono">
                Total: {click.totalClicks}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}