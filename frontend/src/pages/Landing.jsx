import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import SafetyBadge from '../components/SafetyBadge';
import toast from 'react-hot-toast';
import {
  Link2, BarChart3, Shield, Zap, Globe, QrCode,
  ArrowRight, MousePointerClick, Clock,
  Copy, Check, Loader2, ShieldCheck, Twitter, Github, Linkedin,
  ExternalLink, AlertTriangle, Key, Tag, Calendar
} from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Quick URL Shortener state
  const [quickUrl, setQuickUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [shortening, setShortening] = useState(false);
  const [shortenedResult, setShortenedResult] = useState(null);
  const [quickCopied, setQuickCopied] = useState(false);

  // Analytics Preview state
  const [overviewStats, setOverviewStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Safety Checker state
  const [safetyUrl, setSafetyUrl] = useState('');
  const [checking, setChecking] = useState(false);
  const [safetyResult, setSafetyResult] = useState(null);

  useEffect(() => {
    fetchOverviewStats();
  }, []);

  const fetchOverviewStats = async () => {
    try {
      const { data } = await api.get('/public/stats/overview');
      setOverviewStats(data);
    } catch {
      // Silently fail
    } finally {
      setStatsLoading(false);
    }
  };

  const handleQuickShorten = async (e) => {
    e.preventDefault();
    if (!quickUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    if (!user) {
      toast('Please sign in to shorten URLs', { icon: '🔒' });
      navigate('/login');
      return;
    }
    setShortening(true);
    setShortenedResult(null);
    try {
      const { data } = await api.post('/urls', { 
        originalUrl: quickUrl,
        customAlias: customAlias.trim() || undefined,
        expiresAt: expiresAt || undefined
      });
      setShortenedResult(data.url);
      toast.success('URL shortened successfully!');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to shorten URL';
      toast.error(msg);
    } finally {
      setShortening(false);
    }
  };

  const handleQuickCopy = async () => {
    if (!shortenedResult) return;
    try {
      await navigator.clipboard.writeText(shortenedResult.shortUrl);
      setQuickCopied(true);
      toast.success('Copied!');
      setTimeout(() => setQuickCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleSafetyCheck = async (e) => {
    e.preventDefault();
    if (!safetyUrl.trim()) {
      toast.error('Please enter a URL to check');
      return;
    }
    setChecking(true);
    setSafetyResult(null);
    try {
      const { data } = await api.post('/preview', { url: safetyUrl });
      setSafetyResult(data);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to analyze URL';
      toast.error(msg);
    } finally {
      setChecking(false);
    }
  };

  const handleScrollToShortener = () => {
    const el = document.getElementById('quick-shortener');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleExploreAnalytics = () => {
    navigate(user ? '/dashboard?tab=analytics' : '/signup');
  };

  const features = [
    {
      icon: Zap,
      title: 'Smart URL Shortening',
      description: 'Generate customizable, highly optimized links with custom branding, aliases, and redirect parameters.',
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Capture real-time data including engagement rates, clicks, traffic channels, and custom campaign tagging.',
    },
    {
      icon: QrCode,
      title: 'QR Generation',
      description: 'Dynamically generate high-definition QR codes directly tied to your campaigns for cross-channel performance.',
    },
    {
      icon: Shield,
      title: 'URL Safety Detection',
      description: 'Automatic heuristics scan destinations for phish, malware, and spam ratings, validating redirect health.',
    },
    {
      icon: Globe,
      title: 'Device & Geo Analytics',
      description: 'Understand your audience profiles with breakdowns detailing browsers, operating systems, and device models.',
    },
    {
      icon: Tag,
      title: 'Custom Alias Campaigns',
      description: 'Increase click-through rates up to 34% by personalizing short codes for brand campaigns and client projects.',
    },
  ];

  const handleMouseMove = (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    e.currentTarget.style.setProperty('--mouse-x', x.toString());
    e.currentTarget.style.setProperty('--mouse-y', y.toString());
  };

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900 font-sans selection:bg-blue-100 selection:text-surface-900">
      
      {/* ═══════════════════ HERO SECTION (DARK) ═══════════════════ */}
      <section 
        className="pt-32 pb-24 bg-surface-950 text-white relative border-b border-surface-900 parallax-wrapper overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* Floating cards for Hero */}
        <div className="absolute inset-0 pointer-events-none hidden md:block">
          <div className="absolute top-[15%] left-[10%] animate-float parallax-item" style={{'--parallax-factor': '20px'}}>
            <div className="bg-surface-900 border border-surface-800 p-3 rounded-lg shadow-xl flex items-center gap-2 opacity-80">
              <Link2 size={16} className="text-blue-500" />
              <span className="text-xs font-mono text-surface-300">iq.link/r/promo</span>
            </div>
          </div>
          
          <div className="absolute top-[25%] right-[15%] animate-float-delayed parallax-item" style={{'--parallax-factor': '-15px'}}>
            <div className="bg-surface-900 border border-surface-800 p-3 rounded-lg shadow-xl flex flex-col gap-1 opacity-80">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-sky-400" />
                <span className="text-xs font-semibold text-surface-200">Analytics</span>
              </div>
              <span className="text-[10px] text-surface-400">12k Clicks Today</span>
            </div>
          </div>

          <div className="absolute bottom-[20%] left-[18%] animate-float-fast parallax-item" style={{'--parallax-factor': '25px'}}>
            <div className="bg-surface-900 border border-surface-800 p-3 rounded-lg shadow-xl flex items-center gap-2 opacity-80">
              <ShieldCheck size={16} className="text-emerald-500" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-surface-200">Safety Score</span>
                <span className="text-[10px] text-emerald-500">100/100 Safe</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-[25%] right-[20%] animate-float-slow parallax-item" style={{'--parallax-factor': '-20px'}}>
            <div className="bg-surface-900 border border-surface-800 p-3 rounded-lg shadow-xl flex items-center gap-2 opacity-80">
              <QrCode size={16} className="text-purple-500" />
              <span className="text-xs font-medium text-surface-300">QR Generated</span>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-900 border border-surface-800 mb-8 text-xs font-semibold text-surface-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            LinkIQ Platform v2.0
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight max-w-4xl mx-auto">
            Shorten URLs.<br />
            Track Performance. Detect Risks.
          </h1>

          <p className="text-base sm:text-lg text-surface-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            An intelligent platform for URL management, analytics, safety detection, QR generation, and performance tracking.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleScrollToShortener}
              className="btn-primary !px-6 !py-3 flex items-center gap-2 !bg-white !text-surface-950 hover:!bg-surface-100 !shadow-md"
            >
              Create Link
              <ArrowRight size={16} />
            </button>
            <button
              onClick={handleExploreAnalytics}
              className="px-6 py-3 bg-transparent text-surface-300 font-semibold border border-surface-700 rounded-lg hover:bg-surface-800 hover:text-white hover:border-surface-600 transition-all duration-200"
            >
              Explore Analytics
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════ PLATFORM TOOLS SECTION (LIGHT) ═══════════════ */}
      <section className="py-20 bg-white border-b border-surface-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div id="quick-shortener" className="grid grid-cols-1 lg:grid-cols-2 gap-8 scroll-mt-24">
            
            {/* 1. Quick Shortener Card */}
            <div className="glass-card hover-3d p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600">
                    <Zap size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-surface-900">Quick URL Shortener</h3>
                    <p className="text-xs text-surface-500">Shorten a URL instantly and track it.</p>
                  </div>
                </div>
                <p className="text-sm text-surface-600 mb-6">Convert long URLs into compact, high-performance links that inspire trust.</p>
              </div>
              
              <div className="space-y-4">
                <form onSubmit={handleQuickShorten} className="flex flex-col gap-4">
                  {/* Destination URL */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-surface-700 mb-2">
                      <Link2 size={14} className="text-blue-600" />
                      Destination URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={quickUrl}
                      onChange={(e) => { setQuickUrl(e.target.value); setShortenedResult(null); }}
                      placeholder="https://example.com/your-long-url"
                      className="input-field"
                      required
                    />
                  </div>

                  {/* Custom Alias */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-surface-700 mb-2">
                      <Tag size={14} className="text-accent-cyan" />
                      Custom Alias <span className="text-surface-400 text-xs">(optional)</span>
                    </label>
                    <div className="flex items-center gap-0">
                      <span className="px-3 py-2 bg-surface-50 border border-r-0 border-surface-200 rounded-l-md text-sm text-surface-400 font-mono">
                        /
                      </span>
                      <input
                        type="text"
                        value={customAlias}
                        onChange={(e) => setCustomAlias(e.target.value)}
                        placeholder="my-custom-link"
                        className="input-field !rounded-l-none"
                      />
                    </div>
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-surface-700 mb-2">
                      <Calendar size={14} className="text-accent-amber" />
                      Expiry Date <span className="text-surface-400 text-xs">(optional)</span>
                    </label>
                    <input
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="input-field"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={shortening}
                    className="btn-primary w-full mt-2 py-2.5 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {shortening ? <Loader2 size={16} className="animate-spin" /> : 'Shorten Link'}
                  </button>
                </form>

                {shortenedResult && (
                  <div className="p-3 bg-surface-50 border border-surface-200 rounded-md flex items-center justify-between">
                    <a href={shortenedResult.shortUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-mono text-sm truncate pr-4 hover:underline">
                      {shortenedResult.shortUrl}
                    </a>
                    <button onClick={handleQuickCopy} className="text-surface-500 hover:text-surface-900 transition-colors">
                      {quickCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Safety Checker Card */}
            <div className="glass-card hover-3d p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-surface-900">URL Safety Checker</h3>
                    <p className="text-xs text-surface-500">Scan redirects for threats dynamically.</p>
                  </div>
                </div>
                <p className="text-sm text-surface-600 mb-6">Run Heuristic scanners on redirect parameters to review risk score and status ratings.</p>
              </div>

              <div className="space-y-4">
                <form onSubmit={handleSafetyCheck} className="flex flex-col gap-3">
                  <input
                    type="url"
                    value={safetyUrl}
                    onChange={(e) => { setSafetyUrl(e.target.value); setSafetyResult(null); }}
                    placeholder="Enter URL to check safety..."
                    className="input-field"
                    required
                  />
                  <button
                    type="submit"
                    disabled={checking}
                    className="btn-secondary w-full py-2.5 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {checking ? <Loader2 size={16} className="animate-spin" /> : 'Check Safety'}
                  </button>
                </form>

                {safetyResult && (
                  <div className="p-4 bg-surface-50 border border-surface-200 rounded-md">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-surface-500 font-bold uppercase">Safety Rating</span>
                        <span className="text-sm font-semibold text-surface-900">{safetyResult.domain}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <SafetyBadge score={safetyResult.safetyScore} status={safetyResult.safetyStatus} />
                        <span className="text-sm font-bold text-surface-900">
                          {safetyResult.safetyScore}/100
                        </span>
                      </div>
                    </div>
                    {safetyResult.risks?.length > 0 && (
                      <div className="space-y-1.5 mt-3 pt-3 border-t border-surface-200">
                        {safetyResult.risks.map((risk, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-red-700">
                            <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                            <span>
                              <span className="font-semibold">{risk.rule}: </span>
                              {risk.detail}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ═══════════════ ANALYTICS PREVIEW (LIGHT) ═══════════════ */}
      <section className="py-16 relative border-b border-surface-200 overflow-hidden bg-gradient-to-b from-blue-50/80 to-white">
        {/* Strong blue background accents */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
          <div className="absolute top-0 left-[10%] w-[40%] h-[100%] rounded-full bg-blue-400/20 blur-[120px]" />
          <div className="absolute top-[20%] right-[5%] w-[30%] h-[80%] rounded-full bg-indigo-400/15 blur-[120px]" />
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-surface-900 tracking-tight">Platform Analytics Preview</h2>
            <p className="text-surface-500 mt-1 text-sm">Live metrics pulled directly from the platform database.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <div className="bg-white border border-surface-200 rounded-xl p-5 shadow-sm text-left hover:shadow-md hover:border-blue-200 transition-all duration-200 group">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                <Link2 size={15} className="text-blue-600" />
              </div>
              <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider">Total Links</p>
              <p className="text-3xl font-bold text-surface-900 mt-1.5 tabular-nums">
                {statsLoading ? <span className="text-surface-300 text-xl">—</span> : (overviewStats?.totalUrls?.toLocaleString() || '0')}
              </p>
              <p className="text-xs text-surface-400 mt-1">Shortened & tracked</p>
            </div>

            <div className="bg-white border border-surface-200 rounded-xl p-5 shadow-sm text-left hover:shadow-md hover:border-violet-200 transition-all duration-200 group">
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center mb-3">
                <MousePointerClick size={15} className="text-violet-600" />
              </div>
              <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider">Total Clicks</p>
              <p className="text-3xl font-bold text-surface-900 mt-1.5 tabular-nums">
                {statsLoading ? <span className="text-surface-300 text-xl">—</span> : (overviewStats?.totalClicks?.toLocaleString() || '0')}
              </p>
              <p className="text-xs text-surface-400 mt-1">Total engagements</p>
            </div>

            <div className="bg-white border border-surface-200 rounded-xl p-5 shadow-sm text-left hover:shadow-md hover:border-emerald-200 transition-all duration-200 group">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                <Zap size={15} className="text-emerald-600" />
              </div>
              <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider">Active Links</p>
              <p className="text-3xl font-bold text-surface-900 mt-1.5 tabular-nums">
                {statsLoading ? <span className="text-surface-300 text-xl">—</span> : (overviewStats?.activeLinks?.toLocaleString() || '0')}
              </p>
              <p className="text-xs text-surface-400 mt-1">Live routing campaigns</p>
            </div>

            <div className="bg-white border border-surface-200 rounded-xl p-5 shadow-sm text-left hover:shadow-md hover:border-amber-200 transition-all duration-200 group">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
                <Globe size={15} className="text-amber-600" />
              </div>
              <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider">Top Link Domain</p>
              <p className="text-lg font-bold text-surface-900 truncate mt-1.5">
                {statsLoading ? '—' : (overviewStats?.mostClicked?.domain || '—')}
              </p>
              <p className="text-xs text-surface-500 mt-1 font-mono truncate">
                {statsLoading ? '' : overviewStats?.mostClicked
                  ? `/${overviewStats.mostClicked.shortCode} · ${overviewStats.mostClicked.clicks} clicks`
                  : 'No clicks yet'}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES GRID (LIGHT) ═══════════════ */}
      <section className="py-20 relative border-b border-surface-200 overflow-hidden bg-gradient-to-t from-blue-50/80 to-white">
        {/* Strong blue background accents */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
          <div className="absolute bottom-[10%] left-[20%] w-[40%] h-[60%] rounded-full bg-sky-400/20 blur-[120px]" />
          <div className="absolute top-[30%] right-[10%] w-[35%] h-[70%] rounded-full bg-blue-500/15 blur-[120px]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-surface-900 tracking-tight">Platform Capabilities</h2>
            <p className="text-surface-500 mt-1 text-sm">Everything you need to manage, inspect, and grow your link pipelines.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="bg-white border border-surface-200 rounded-xl p-6 flex flex-col items-start hover:border-blue-200 hover:shadow-md transition-all duration-200 group">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 text-blue-600 group-hover:bg-blue-100 transition-colors">
                  <feature.icon size={18} />
                </div>
                <h3 className="text-sm font-bold text-surface-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER (DARK) ═══════════════ */}
      <footer className="bg-surface-950 pt-16 pb-8 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            
            <div className="col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded bg-surface-900 border border-surface-700 flex items-center justify-center overflow-hidden">
                  <img src="/logo.png" alt="LinkIQ Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-lg font-semibold text-white tracking-tight">LinkIQ</span>
              </Link>
              <p className="text-sm text-surface-400 mb-6 max-w-xs leading-relaxed">
                The open-source link intelligence infrastructure for modern marketing and engineering teams.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-surface-500 hover:text-white transition-colors"><Twitter size={16} /></a>
                <a href="#" className="text-surface-500 hover:text-white transition-colors"><Github size={16} /></a>
                <a href="#" className="text-surface-500 hover:text-white transition-colors"><Linkedin size={16} /></a>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-white mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-surface-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security Details</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-white mb-4">Resources</h4>
              <ul className="space-y-3 text-sm text-surface-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety Lookup</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-surface-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-surface-500">
              © {new Date().getFullYear()} LinkIQ. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs text-surface-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
