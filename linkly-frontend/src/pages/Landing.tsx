import { Link } from 'react-router-dom';
import {
  Link2, Zap, BarChart3, Shield, ArrowRight, Check,
  Sparkles, Code2, Globe, Copy, MousePointer2,
  TrendingUp,
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated gradient orbs - fixed to viewport */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 -right-40 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pink-500/5 rounded-full blur-[150px]"></div>
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168, 85, 247, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 85, 247, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
        }}
      ></div>

      {/* Navbar */}
      <nav className="relative z-50 sticky top-0 backdrop-blur-xl bg-black/50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition"></div>
              <div className="relative w-9 h-9 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <Link2 className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight">Linkly</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <Link to="/api-keys" className="hover:text-white transition">API</Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 text-sm text-white/70 hover:text-white transition font-medium"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm bg-white text-black rounded-lg hover:bg-white/90 transition font-semibold"
            >
              Start free →
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-32">
        {/* Announcement Banner */}
        <div className="flex justify-center mb-8">
          <a 
            href="#features"
            className="group inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-white/80 backdrop-blur-sm transition"
          >
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              New
            </span>
            <span className="text-white/60">Real-time analytics dashboard is live</span>
            <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Headline */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] mb-6">
            <span className="text-white">Short links.</span>
            <br />
            <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              Big data.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            The URL shortener that gives you superpowers.
            Track clicks, generate QR codes, and shorten with a beautiful API.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-16">
            <Link
              to="/register"
              className="group relative px-8 py-3.5 bg-white text-black rounded-xl font-semibold text-base hover:bg-white/90 transition flex items-center gap-2"
            >
              Start shortening
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 text-white/70 hover:text-white transition font-medium flex items-center gap-2"
            >
              Live demo →
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 text-xs text-white/40 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-green-400" />
              No credit card
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-green-400" />
              Free forever
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-green-400" />
              Setup in 30s
            </span>
          </div>
        </div>

        {/* Hero Product Preview */}
        <div className="relative mt-20 max-w-5xl mx-auto">
          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-cyan-500/30 rounded-2xl blur-3xl opacity-50"></div>
          
          {/* Browser mockup */}
          <div className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-black/40">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-white/5 rounded-md px-3 py-1 text-xs text-white/40 font-mono max-w-md mx-auto">
                  linkly-mu.vercel.app/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard preview */}
            <div className="p-6 md:p-10">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { label: 'Total links', value: '1,247', trend: '+12%', color: 'purple' },
                  { label: 'Clicks today', value: '8,392', trend: '+23%', color: 'cyan' },
                  { label: 'Countries', value: '47', trend: '+3', color: 'pink' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                    <div className="text-xs text-white/40 mb-1">{stat.label}</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className={`text-xs text-${stat.color}-400`}>{stat.trend}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sample link */}
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium mb-1">GitHub Copilot Features</div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-cyan-400 font-mono">linkly.dev/gh-copilot</span>
                      <Copy className="w-3 h-3 text-white/30 cursor-pointer hover:text-white/60" />
                    </div>
                    <div className="text-xs text-white/30 mt-1 truncate">→ github.com/features/copilot</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      3,421
                    </div>
                    <div className="text-xs text-white/40">clicks</div>
                  </div>
                </div>
              </div>

              {/* Mini chart placeholder */}
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 h-24 flex items-end gap-1">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-purple-500/50 to-cyan-400/50 rounded-sm hover:opacity-80 transition"
                    style={{ height: `${h}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <div className="absolute -top-4 right-8 md:right-16 bg-black border border-white/10 rounded-full px-4 py-2 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/70">Live traffic</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BENTO GRID FEATURES ===== */}
      {/* ===== FEATURES GRID ===== */}
      <section id="features" className="relative max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs mb-6">
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
            <span className="text-purple-300 font-medium tracking-wide">FEATURES</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
            <span className="text-white">Built for</span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              modern teams
            </span>
          </h2>
          
          <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Every feature you need to build, track, and grow.
            <br className="hidden md:block" />
            <span className="text-white/30">No fluff. Just what works.</span>
          </p>
        </div>

        {/* 3x2 Equal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              number: '01',
              tag: 'ANALYTICS',
              icon: BarChart3,
              title: 'Real-time insights',
              desc: 'Track every click as it happens. Country, device, browser, referrer — all captured automatically.',
              color: 'purple',
              preview: (
                <div className="grid grid-cols-2 gap-2 mt-6">
                  {[
                    { flag: '🇺🇸', code: 'US', value: '4.2k' },
                    { flag: '🇬🇧', code: 'UK', value: '1.8k' },
                    { flag: '🇮🇳', code: 'IN', value: '2.4k' },
                    { flag: '🇩🇪', code: 'DE', value: '890' },
                  ].map((c, i) => (
                    <div key={i} className="bg-black/40 border border-white/5 rounded-lg p-2 flex items-center gap-2">
                      <span className="text-lg">{c.flag}</span>
                      <div className="flex-1">
                        <div className="text-[10px] text-white/40 font-mono">{c.code}</div>
                        <div className="text-sm font-bold">{c.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ),
            },
            {
              number: '02',
              tag: 'SPEED',
              icon: Zap,
              title: 'Lightning fast',
              desc: 'Global edge caching with Redis. Every redirect happens in under 50 milliseconds.',
              color: 'yellow',
              preview: (
                <div className="mt-6 text-center py-2">
                  <div className="text-5xl font-black bg-gradient-to-br from-yellow-300 to-orange-500 bg-clip-text text-transparent leading-none">
                    23<span className="text-xl text-white/40 ml-1">ms</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-3 text-xs text-white/40">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span>average redirect</span>
                  </div>
                </div>
              ),
            },
            {
              number: '03',
              tag: 'DEVELOPER API',
              icon: Code2,
              title: 'Beautiful API',
              desc: 'RESTful endpoints with full documentation. Simple to integrate, powerful to use.',
              color: 'cyan',
              preview: (
                <div className="mt-6 bg-black/60 border border-white/5 rounded-lg p-3 font-mono text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-green-400 font-bold">POST</span>
                    <span className="text-white/70">/api/shorten</span>
                  </div>
                  <div className="text-white/30 text-[10px]">→ 200 OK · 23ms</div>
                </div>
              ),
            },
            {
              number: '04',
              tag: 'SECURITY',
              icon: Shield,
              title: 'Enterprise grade',
              desc: 'Password protection, JWT authentication, and expiring links built-in from day one.',
              color: 'green',
              preview: (
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="text-[10px] px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-md text-green-400 font-mono">JWT</span>
                  <span className="text-[10px] px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-md text-green-400 font-mono">BCRYPT</span>
                  <span className="text-[10px] px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-md text-green-400 font-mono">TLS 1.3</span>
                  <span className="text-[10px] px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-md text-green-400 font-mono">2FA</span>
                </div>
              ),
            },
            {
              number: '05',
              tag: 'QR CODES',
              icon: Sparkles,
              title: 'Auto QR generation',
              desc: 'Every link gets a beautiful, scannable QR code. Perfect for print and offline sharing.',
              color: 'pink',
              preview: (
                <div className="mt-6 flex justify-center py-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-pink-500/20 blur-xl"></div>
                    <div className="relative w-16 h-16 bg-white rounded-lg p-1.5">
                      <div 
                        className="w-full h-full bg-black rounded-sm" 
                        style={{
                          backgroundImage: `
                            radial-gradient(circle, white 1px, transparent 1px),
                            linear-gradient(black, black)
                          `,
                          backgroundSize: '5px 5px',
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              number: '06',
              tag: 'MANAGEMENT',
              icon: Globe,
              title: 'Full control',
              desc: 'Search, filter, edit, and organize all your links. Custom slugs and link expiration.',
              color: 'blue',
              preview: (
                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-white/60">Custom slugs</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-white/60">Link expiration</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-white/60">Search & filters</span>
                  </div>
                </div>
              ),
            },
          ].map((f, i) => (
            <div
              key={i}
              className={`group relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 rounded-2xl p-6 hover:border-${f.color}-500/30 transition-all duration-500 overflow-hidden`}
            >
              {/* Glow effect */}
              <div className={`absolute top-0 right-0 w-40 h-40 bg-${f.color}-500/10 rounded-full blur-3xl group-hover:bg-${f.color}-500/20 transition-all duration-500`}></div>
              
              <div className="relative">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-11 h-11 bg-${f.color}-500/10 border border-${f.color}-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <f.icon className={`w-5 h-5 text-${f.color}-400`} />
                  </div>
                  <div className={`text-xs text-${f.color}-400 font-mono tracking-wider`}>
                    {f.number} · {f.tag}
                  </div>
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-bold mb-2 tracking-tight">{f.title}</h3>
                
                {/* Description */}
                <p className="text-white/50 text-sm leading-relaxed">
                  {f.desc}
                </p>

                {/* Preview */}
                {f.preview}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SOCIAL PROOF ===== */}
      <section className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '10K+', label: 'Links shortened' },
            { value: '500K+', label: 'Clicks tracked' },
            { value: '99.9%', label: 'Uptime' },
            { value: '<50ms', label: 'Avg latency' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-white/40">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-16">
          <div className="text-sm text-cyan-400 font-mono mb-3">HOW IT WORKS</div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
            Three steps to <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">launch</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>

          {[
            {
              step: '01',
              title: 'Sign up',
              desc: 'Create your free account in 30 seconds. No credit card required.',
              icon: MousePointer2,
            },
            {
              step: '02',
              title: 'Shorten',
              desc: 'Paste any URL, add custom slug, get instant short link with QR code.',
              icon: Link2,
            },
            {
              step: '03',
              title: 'Track',
              desc: 'Watch real-time analytics as clicks pour in from around the world.',
              icon: TrendingUp,
            },
          ].map((s, i) => (
            <div key={i} className="relative text-center">
              <div className="relative inline-block mb-6">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <s.icon className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 text-xs font-mono text-purple-400 bg-black border border-purple-500/30 rounded-full px-2 py-0.5">
                  {s.step}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">{s.title}</h3>
              <p className="text-white/50 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="relative max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-16">
          <div className="text-sm text-pink-400 font-mono mb-3">PRICING</div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Simple pricing
          </h2>
          <p className="text-white/50 text-lg">
            Start free, upgrade when you grow
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {[
            {
              name: 'Free',
              price: '0',
              features: ['50 links/month', 'Basic analytics', 'QR codes', 'Community support'],
            },
            {
              name: 'Pro',
              price: '9',
              popular: true,
              features: ['5,000 links', 'Advanced analytics', 'Custom slugs', 'API access', 'Priority support'],
            },
            {
              name: 'Business',
              price: '29',
              features: ['Unlimited links', 'Custom domains', 'Team workspace', 'SLA guarantee', 'Dedicated support'],
            },
          ].map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-8 transition ${
                plan.popular
                  ? 'bg-gradient-to-b from-purple-500/10 to-transparent border border-purple-500/50'
                  : 'bg-white/[0.03] border border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full font-semibold">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white/80 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold">${plan.price}</span>
                  <span className="text-white/40">/mo</span>
                </div>
              </div>

              <Link
                to="/register"
                className={`block text-center py-3 rounded-xl font-semibold transition mb-6 ${
                  plan.popular
                    ? 'bg-white text-black hover:bg-white/90'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10'
                }`}
              >
                Get started
              </Link>

              <ul className="space-y-3">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-white/70">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative max-w-4xl mx-auto px-6 py-32">
        <div className="relative bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-cyan-500/10 border border-white/10 rounded-3xl p-12 md:p-16 text-center overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Ready to <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">shorten</span>?
            </h2>
            <p className="text-white/60 text-lg mb-8 max-w-md mx-auto">
              Join thousands of developers already using Linkly to track their links.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/register"
                className="px-8 py-3.5 bg-white text-black rounded-xl font-semibold hover:bg-white/90 transition inline-flex items-center justify-center gap-2"
              >
                Start for free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://github.com/chintanchhapgar/Linkly"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3.5 bg-white/5 border border-white/10 rounded-xl font-semibold hover:bg-white/10 transition"
              >
                View on GitHub →
              </a>
            </div>

            <div className="mt-6 text-xs text-white/40">
              No credit card required · Free forever · Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <Link2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">Linkly</span>
              <span className="text-white/30 text-sm ml-2">© 2026</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-white/50">
              <a href="#features" className="hover:text-white transition">Features</a>
              <a href="#pricing" className="hover:text-white transition">Pricing</a>
              <Link to="/api-keys" className="hover:text-white transition">API</Link>
              <a 
                href="https://github.com/chintanchhapgar/Linkly" 
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                GitHub
              </a>
            </div>

            <div className="text-sm text-white/40">
              Built with 💜 by{' '}
              <a 
                href="https://github.com/chintanchhapgar" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition"
              >
                @chintanchhapgar
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}