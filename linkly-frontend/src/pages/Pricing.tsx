import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, Loader2, Zap, Sparkles, Award, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import Navbar from '../components/Navbar';

export default function Pricing() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => (await api.get('/api/subscription/plans')).data,
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => (await api.get('/api/subscription/current')).data,
    enabled: !!token,
  });

  const handleUpgrade = async (planKey: string) => {
    if (!token) {
      navigate('/register');
      return;
    }

    const plan = plans?.[planKey];
    if (!plan?.priceId) {
      toast.info('This is the free plan');
      return;
    }

    setLoading(planKey);
    try {
      const { data } = await api.post('/api/subscription/checkout', {
        priceId: plan.priceId,
      });
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to start checkout');
      setLoading(null);
    }
  };

  if (!plans) {
    return (
      <div className="min-h-screen bg-cyber-bg text-white">
        {token && <Navbar />}
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      </div>
    );
  }

  const planIcons: Record<string, any> = {
    FREE: Zap,
    PRO: Sparkles,
    BUSINESS: Award,
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-white relative">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none"></div>
      {token && <Navbar />}

      <div className="max-w-7xl mx-auto px-6 py-16 relative">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-full text-sm font-medium mb-4">
            ⚡ Choose your plan
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Simple, <span className="gradient-text">Transparent Pricing</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Start free, upgrade when you need more power
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {Object.entries(plans).map(([key, plan]: [string, any]) => {
            const Icon = planIcons[key] || Zap;
            const isCurrentPlan = subscription?.plan === key;
            const isPopular = key === 'PRO';

            return (
              <div
                key={key}
                className={`relative p-8 rounded-2xl border transition ${
                  isPopular
                    ? 'border-purple-500 bg-gradient-to-b from-purple-500/10 to-cyan-500/5 shadow-2xl shadow-purple-500/20'
                    : 'border-cyber-border bg-cyber-card hover:border-purple-500/30'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs rounded-full font-medium">
                    MOST POPULAR
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4 px-3 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
                    CURRENT PLAN
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isPopular
                        ? 'bg-gradient-to-br from-purple-600 to-cyan-500'
                        : 'bg-cyber-hover'
                    }`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                </div>

                <div className="mb-6">
                  <div className="text-5xl font-bold">
                    ${plan.price}
                    <span className="text-sm font-normal text-slate-500">/mo</span>
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    {plan.maxLinks === -1
                      ? 'Unlimited links'
                      : `Up to ${plan.maxLinks.toLocaleString()} links`}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f: string, j: number) => (
                    <li key={j} className="flex items-start gap-2 text-slate-300 text-sm">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(key)}
                  disabled={isCurrentPlan || loading === key}
                  className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                    isCurrentPlan
                      ? 'bg-cyber-hover text-slate-400 cursor-not-allowed'
                      : isPopular
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:opacity-90 btn-glow'
                      : 'bg-cyber-hover text-white hover:bg-cyber-border'
                  }`}
                >
                  {loading === key ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : plan.price === 0 ? (
                    'Get Started'
                  ) : (
                    <>
                      Upgrade to {plan.name}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ / Info */}
        <div className="max-w-3xl mx-auto mt-16 text-center">
          <p className="text-slate-400">
            💳 All plans include a 14-day money-back guarantee. Cancel anytime.
          </p>
          <p className="text-slate-500 text-sm mt-2">
            🔒 Secure payments powered by Stripe. Test mode active.
          </p>
        </div>
      </div>
    </div>
  );
}