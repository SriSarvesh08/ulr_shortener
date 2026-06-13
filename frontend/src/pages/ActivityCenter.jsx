import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import {
  Activity, Link2, QrCode, ShieldCheck, MousePointerClick,
  Clock, ExternalLink, BarChart3
} from 'lucide-react';

const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const getDomain = (urlStr) => {
  try { return new URL(urlStr).hostname.replace('www.', ''); }
  catch { return urlStr; }
};

const ActivityCenter = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/urls', { params: { limit: 20 } });
        setUrls(data.urls || []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  // Derive timeline events from real URL data
  const events = urls.flatMap((url) => {
    const events = [];
    // Created event
    events.push({
      id: `created-${url.id}`,
      type: 'created',
      label: 'Link created',
      description: getDomain(url.originalUrl),
      shortUrl: url.shortUrl,
      urlId: url.id,
      time: url.createdAt,
    });
    // Click events (simulated from click count — shows top clicked links)
    if (url.clicks > 0) {
      events.push({
        id: `click-${url.id}`,
        type: 'click',
        label: `${url.clicks.toLocaleString()} click${url.clicks !== 1 ? 's' : ''} recorded`,
        description: getDomain(url.originalUrl),
        shortUrl: url.shortUrl,
        urlId: url.id,
        time: url.createdAt, // use created as proxy for last activity
      });
    }
    // Safety event
    if (url.safetyStatus) {
      events.push({
        id: `safety-${url.id}`,
        type: 'safety',
        label: `Safety check: ${url.safetyStatus}`,
        description: `Score ${url.safetyScore ?? 'N/A'}/100 · ${getDomain(url.originalUrl)}`,
        shortUrl: url.shortUrl,
        urlId: url.id,
        time: url.createdAt,
      });
    }
    return events;
  });

  // Sort by time descending
  events.sort((a, b) => new Date(b.time) - new Date(a.time));

  const iconMap = {
    created: { icon: Link2,           bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-100' },
    click:   { icon: MousePointerClick,bg: 'bg-violet-50',  text: 'text-violet-600',  border: 'border-violet-100' },
    safety:  { icon: ShieldCheck,      bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    qr:      { icon: QrCode,           bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-100' },
  };

  // Summary stats
  const totalClicks = urls.reduce((s, u) => s + u.clicks, 0);
  const safeLinks = urls.filter(u => u.safetyStatus === 'safe').length;
  const activeLinks = urls.filter(u => !u.expiresAt || new Date(u.expiresAt) > new Date()).length;

  return (
    <div className="space-y-7">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Activity Center</h1>
        <p className="text-sm text-surface-500 mt-1">A timeline of events across all your shortened links.</p>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Links',   value: urls.length,   icon: Link2,            bg: 'bg-blue-50',    text: 'text-blue-600' },
          { label: 'Total Clicks',  value: totalClicks,   icon: MousePointerClick, bg: 'bg-violet-50',  text: 'text-violet-600' },
          { label: 'Safe Links',    value: safeLinks,     icon: ShieldCheck,       bg: 'bg-emerald-50', text: 'text-emerald-600' },
          { label: 'Active Links',  value: activeLinks,   icon: Activity,          bg: 'bg-amber-50',   text: 'text-amber-600' },
        ].map(({ label, value, icon: Icon, bg, text }) => (
          <div key={label} className="bg-white border border-surface-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={16} className={text} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider">{label}</p>
              <p className="text-xl font-bold text-surface-900">{value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Timeline ── */}
      <div className="bg-white border border-surface-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-100 flex items-center gap-2">
          <Clock size={14} className="text-surface-400" />
          <h2 className="text-sm font-semibold text-surface-900">Event Timeline</h2>
          <span className="ml-auto text-xs text-surface-400">{events.length} events</span>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center gap-3 text-surface-400">
            <Activity size={28} className="animate-pulse" />
            <p className="text-sm">Loading activity…</p>
          </div>
        ) : events.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 bg-surface-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Activity size={22} className="text-surface-400" />
            </div>
            <p className="text-sm font-semibold text-surface-900 mb-1">No activity yet</p>
            <p className="text-xs text-surface-500">Create your first link to start seeing events here.</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-50">
            {events.slice(0, 40).map((event) => {
              const { icon: Icon, bg, text, border } = iconMap[event.type] || iconMap.created;
              return (
                <div key={event.id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-surface-50/60 transition-colors group">
                  {/* Icon */}
                  <div className={`mt-0.5 w-7 h-7 rounded-lg ${bg} border ${border} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={13} className={text} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-surface-900">{event.label}</p>
                    <p className="text-xs text-surface-500 truncate mt-0.5">{event.description}</p>
                    <a
                      href={event.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono text-blue-500 hover:underline flex items-center gap-0.5 mt-0.5 w-fit"
                    >
                      {event.shortUrl}
                      <ExternalLink size={9} />
                    </a>
                  </div>

                  {/* Time + Action */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="text-[11px] text-surface-400 whitespace-nowrap">{timeAgo(event.time)}</span>
                    <Link
                      to={`/analytics/${event.urlId}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-blue-500 hover:underline flex items-center gap-0.5"
                    >
                      <BarChart3 size={10} /> Insights
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityCenter;
