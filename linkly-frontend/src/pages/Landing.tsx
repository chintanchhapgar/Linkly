import { Link } from 'react-router-dom';
import { Link2, Zap, BarChart3, Shield, ArrowRight, Check, Sparkles, Code2, Globe } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-cyber-bg text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-bg opacity-40"></div>
      <div className="absolute inset-0 radial-glow"></div>

      {/* Navbar */}
      <nav className="relative border-b border-cyber-border bg-cyber-bg/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/50">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Linkly</span>
          </div>
          <div className="flex gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-slate-300 hover:text-white font-medium transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-lg hover:opacity-90 font-medium transition btn-glow"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-full text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          Sub-50ms redirects worldwide
        </div>
        
        <h1 className="text-7xl font-bold mb-6 leading-tight tracking-tight">
          Short Links,
          <br />
          <span className="gradient-text">Infinite Power</span>
        </h1>
        
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          The URL shortener built for developers. Lightning-fast redirects,
          real-time analytics, and a beautiful API.
        </p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to="/register"
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-xl hover:opacity-90 font-semibold text-lg flex items-center gap-2 transition btn-glow"
          >
            Start Free <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#features"
            className="px-8 py-4 bg-cyber-card border border-cyber-border text-white rounded-xl hover:bg-cyber-hover font-semibold text-lg transition"
          >
            View Features
          </a>
        </div>

        {/* Terminal Preview */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="bg-cyber-card border border-cyber-border rounded-xl overflow-hidden shadow-2xl shadow-purple-500/20">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-cyber-border bg-black/40">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="ml-2 text-xs text-slate-400 font-mono">Terminal — API Example</span>
            </div>
            <div className="p-6 font-mono text-sm text-left space-y-2">
              {/* Request */}
              <div>
                <span className="text-green-400">$</span>{' '}
                <span className="text-white">curl</span>{' '}
                <span className="text-cyan-400">-X POST</span>
              </div>
              <div className="pl-4 text-yellow-300">
                https://linkly-api-313v.onrender.com/api/public/shorten
              </div>
              <div className="pl-4 text-slate-400">
                <span className="text-cyan-400">-H</span>{' '}
                <span className="text-yellow-300">"x-api-key: lk_live_..."</span>
              </div>
              <div className="pl-4 text-slate-400">
                <span className="text-cyan-400">-d</span>{' '}
                <span className="text-yellow-300">'{`{"url": "https://google.com"}`}'</span>
              </div>

              {/* Response */}
              <div className="mt-4 pl-2 border-l-2 border-purple-500/50">
                <div className="text-cyan-400">
                  → <span className="text-white">https://linkly-mu.vercel.app/</span>
                  <span className="text-purple-400 font-bold">google</span>
                </div>
                <div className="text-green-400 mt-1">
                  ✓ Created in <span className="font-bold">23ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">
            Built for <span className="gradient-text">Speed</span>
          </h2>
          <p className="text-slate-400 text-lg">Everything you need, nothing you don't</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Zap,
              title: 'Lightning Fast',
              desc: 'Sub-50ms redirects powered by edge Redis caching worldwide',
              color: 'from-yellow-500 to-orange-500',
            },
            {
              icon: BarChart3,
              title: 'Real-time Analytics',
              desc: 'Track clicks, locations, devices, and browsers as they happen',
              color: 'from-purple-500 to-pink-500',
            },
            {
              icon: Code2,
              title: 'Developer API',
              desc: 'RESTful API with full documentation and SDKs for every language',
              color: 'from-cyan-500 to-blue-500',
            },
            {
              icon: Shield,
              title: 'Enterprise Security',
              desc: 'JWT auth, rate limiting, and password-protected links',
              color: 'from-green-500 to-emerald-500',
            },
            {
              icon: Globe,
              title: 'Custom Domains',
              desc: 'Use your own branded domain for professional short links',
              color: 'from-blue-500 to-indigo-500',
            },
            {
              icon: Sparkles,
              title: 'QR Codes',
              desc: 'Generate beautiful QR codes for every link automatically',
              color: 'from-pink-500 to-rose-500',
            },
          ].map((f, i) => (
            <div
              key={i}
              className="group p-6 bg-cyber-card border border-cyber-border rounded-2xl hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '<50ms', label: 'Redirect Speed' },
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '10M+', label: 'Links Created' },
            { value: '150+', label: 'Countries' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                {stat.value}
              </div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-slate-400 text-lg">Start free, upgrade when you need to</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              name: 'Free',
              price: '$0',
              features: ['50 links/month', 'Basic analytics', 'QR codes', '30-day history'],
            },
            {
              name: 'Pro',
              price: '$9',
              popular: true,
              features: ['5,000 links', 'Advanced analytics', 'Custom slugs', 'API access', 'No branding'],
            },
            {
              name: 'Business',
              price: '$29',
              features: ['Unlimited links', 'Custom domains', 'Team workspace', 'Priority support', 'SLA'],
            },
          ].map((plan, i) => (
            <div
              key={i}
              className={`relative p-8 rounded-2xl border transition ${
                plan.popular
                  ? 'border-purple-500 bg-gradient-to-b from-purple-500/10 to-cyan-500/5 shadow-2xl shadow-purple-500/20'
                  : 'border-cyber-border bg-cyber-card hover:border-purple-500/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs rounded-full font-medium">
                  MOST POPULAR
                </div>
              )}
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="text-5xl font-bold mb-6">
                {plan.price}
                <span className="text-sm font-normal text-slate-500">/mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-slate-300">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className={`block text-center py-3 rounded-lg font-semibold transition ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:opacity-90 btn-glow'
                    : 'bg-cyber-hover text-white hover:bg-cyber-border'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="p-12 rounded-3xl bg-gradient-to-br from-purple-600/20 to-cyan-500/20 border border-purple-500/30">
          <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-slate-300 mb-8 text-lg">
            Join thousands of developers shortening URLs with Linkly
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-xl hover:opacity-90 font-semibold text-lg transition btn-glow"
          >
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-cyber-border py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
          © 2026 Linkly. Built with <span className="text-purple-400">♥</span> for developers
        </div>
      </footer>
    </div>
  );
}