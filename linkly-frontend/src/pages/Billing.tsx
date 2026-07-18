import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CreditCard, Award, Check, Loader2, ExternalLink,
  Calendar, TrendingUp, Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import Navbar from '../components/Navbar';

export default function Billing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const { data: subscription, isLoading, refetch } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => (await api.get('/api/subscription/current')).data,
  });

  useEffect(() => {
    if (searchParams.get('success')) {
      toast.success('🎉 Subscription activated! Welcome to Pro!');
      // Refetch after a moment (webhook needs time)
      setTimeout(() => refetch(), 2000);
    }
  }, [searchParams, refetch]);

  const openBillingPortal = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/subscription/portal');
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to open portal');
      setLoading(false);
    }
  };

  if (isLoading || !subscription) {
    return (
      <div className="min-h-screen bg-cyber-bg text-white">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      </div>
    );
  }

  const { plan, planInfo, linkCount, linkLimit, hasActiveSubscription, currentPeriodEnd } = subscription;
  const usagePercent = linkLimit === -1 ? 0 : (linkCount / linkLimit) * 100;

  return (
    <div className="min-h-screen bg-cyber-bg text-white relative">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none"></div>
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-8 relative">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Billing & Plans</h1>
          <p className="text-slate-400 mt-1">Manage your subscription and billing</p>
        </div>

        {/* Current Plan */}
        <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/5 border border-purple-500/30 rounded-2xl p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-purple-400 mb-2">
                <Award className="w-4 h-4" />
                CURRENT PLAN
              </div>
              <h2 className="text-4xl font-bold">{planInfo.name}</h2>
              <p className="text-slate-400 mt-1">
                {planInfo.price === 0 ? 'Free forever' : `$${planInfo.price}/month`}
              </p>
            </div>
            {hasActiveSubscription && (
              <button
                onClick={openBillingPortal}
                disabled={loading}
                className="px-4 py-2 bg-cyber-card border border-cyber-border text-white rounded-lg font-medium hover:bg-cyber-hover disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
                Manage Billing
              </button>
            )}
          </div>

          {/* Usage */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Links used this month</span>
              <span className="font-medium">
                {linkCount} / {linkLimit === -1 ? '∞' : linkLimit}
              </span>
            </div>
            {linkLimit !== -1 && (
              <div className="h-2 bg-cyber-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all"
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
            )}
          </div>

          {currentPeriodEnd && (
            <div className="mt-6 pt-6 border-t border-purple-500/20 flex items-center gap-2 text-sm text-slate-400">
              <Calendar className="w-4 h-4" />
              {hasActiveSubscription ? 'Renews' : 'Expires'} on{' '}
              <span className="text-white font-medium">
                {new Date(currentPeriodEnd).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">Your Plan Includes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {planInfo.features.map((feature: string, i: number) => (
              <div key={i} className="flex items-center gap-2 text-slate-300">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade CTA */}
        {plan !== 'BUSINESS' && (
          <div className="bg-cyber-card border border-cyber-border rounded-xl p-8 text-center">
            <TrendingUp className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Ready to grow?</h3>
            <p className="text-slate-400 mb-6">
              Unlock more features and higher limits with a paid plan
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-lg font-semibold hover:opacity-90 transition btn-glow"
            >
              <Zap className="w-5 h-5" />
              View Plans
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}