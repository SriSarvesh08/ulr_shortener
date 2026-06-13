import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../lib/axios';
import ClickChart from '../components/ClickChart';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import SafetyBadge from '../components/SafetyBadge';
import {
  MousePointerClick, Clock, Globe, Monitor, Smartphone,
  ExternalLink, BarChart3, Laptop, Tablet, Link2, Calendar,
  QrCode, Download, AlertCircle
} from 'lucide-react';

const PublicStats = () => {
  const { shortCode } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const qrRef = useRef(null);

  useEffect(() => {
    if (shortCode) fetchPublicStats();
  }, [shortCode]);

  const fetchPublicStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/public/stats/${shortCode}`);
      setData(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('This short URL does not exist or has been removed.');
      } else {
        setError('Failed to load stats. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  const getDeviceIcon = (device) => {
    const d = (device || '').toLowerCase();
    if (d.includes('mobile') || d.includes('phone')) return Smartphone;
    if (d.includes('tablet')) return Tablet;
    if (d.includes('laptop')) return Laptop;
    return Monitor;
  };

  const handleDownloadQR = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 32, 32, 448, 448);
      const link = document.createElement('a');
      link.download = `qr-${shortCode}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading public stats..." />
      </div>
    );
  }

  /* ── Error State ── */
  if (error) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
        <div className="bg-white border border-surface-200 rounded-lg p-8 text-center max-w-md shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={22} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-surface-900 mb-2">Stats Not Found</h2>
          <p className="text-surface-500 mb-6 text-sm">{error}</p>
          <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 bg-surface-900 text-white font-medium text-sm rounded-md hover:bg-surface-800 transition-colors">
            <Link2 size={14} />
            Go to LinkIQ
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { url, analytics } = data;
  const isExpired = url.isExpired;

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 mb-4">
            <BarChart3 size={13} className="text-blue-600" />
            <span className="text-xs font-semibold text-blue-700">Public Stats</span>
          </div>
          <h1 className="text-3xl font-bold text-surface-900 tracking-tight mb-1">Link Statistics</h1>
          <p className="text-surface-500 text-sm">Public analytics for this shortened URL</p>
        </div>

        {/* URL Info Card */}
        <div className="bg-white border border-surface-200 rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex-1 min-w-0">

              {/* Short URL */}
              <a
                href={url.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-mono font-semibold text-lg flex items-center gap-2 mb-2 transition-colors break-all"
              >
                {url.shortUrl}
                <ExternalLink size={15} className="flex-shrink-0" />
              </a>

              {/* Meta row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-100 border border-surface-200 text-xs text-surface-600 font-medium">
                  <Globe size={12} />
                  {url.domain || '—'}
                </span>

                {url.safetyStatus && (
                  <SafetyBadge score={url.safetyScore} status={url.safetyStatus} showScore size="md" />
                )}

                {isExpired ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-red-50 border border-red-200 text-xs font-medium text-red-700">
                    Expired
                  </span>
                ) : url.expiresAt ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-xs font-medium text-amber-700">
                    <Calendar size={10} />
                    Expires {formatDate(url.expiresAt)}
                  </span>
                ) : null}
              </div>

              <p className="text-xs text-surface-400 mt-2">
                Created {formatDate(url.createdAt)}
              </p>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div ref={qrRef} className="p-3 bg-white border border-surface-200 rounded-lg">
                <QRCodeSVG value={url.shortUrl} size={110} level="H" bgColor="#ffffff" fgColor="#18181b" />
              </div>
              <button
                onClick={handleDownloadQR}
                className="flex items-center gap-1.5 text-xs text-surface-500 hover:text-blue-600 transition-colors"
              >
                <Download size={12} />
                Download QR
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard icon={MousePointerClick} label="Total Clicks" value={analytics.totalClicks ?? 0} />
          <StatsCard
            icon={Clock}
            label="Last Visited"
            value={analytics.lastVisited ? formatDateTime(analytics.lastVisited).split(',')[0] : 'Never'}
            subValue={analytics.lastVisited ? formatDateTime(analytics.lastVisited).split(',')[1]?.trim() : null}
          />
          <StatsCard icon={Globe} label="Browsers" value={analytics.browserStats?.length || 0} subValue="unique" />
          <StatsCard icon={Monitor} label="Devices" value={analytics.deviceStats?.length || 0} subValue="types" />
        </div>

        {/* Daily Clicks Chart */}
        <div className="bg-white border border-surface-200 rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-surface-900 flex items-center gap-2">
              <BarChart3 size={15} className="text-blue-600" />
              Daily Clicks
            </h2>
            <span className="text-xs font-medium px-2 py-1 bg-surface-50 border border-surface-200 text-surface-500 rounded">
              Last 30 Days
            </span>
          </div>
          <ClickChart data={analytics.dailyClicks || []} height={260} />
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Browser Stats */}
          <div className="bg-white border border-surface-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Globe size={13} className="text-blue-500" />
              Top Browsers
            </h3>
            {analytics.browserStats?.length > 0 ? (
              <div className="space-y-3">
                {analytics.browserStats.map((b, i) => {
                  const pct = analytics.totalClicks > 0
                    ? Math.round((b.count / analytics.totalClicks) * 100)
                    : 0;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-surface-800 font-medium">{b.name}</span>
                        <span className="text-surface-500 text-xs">{b.count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-surface-400 text-center py-4">No browser data yet</p>
            )}
          </div>

          {/* Device Stats */}
          <div className="bg-white border border-surface-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Monitor size={13} className="text-emerald-500" />
              Devices
            </h3>
            {analytics.deviceStats?.length > 0 ? (
              <div className="space-y-3">
                {analytics.deviceStats.map((d, i) => {
                  const pct = analytics.totalClicks > 0
                    ? Math.round((d.count / analytics.totalClicks) * 100)
                    : 0;
                  const DeviceIcon = getDeviceIcon(d.name);
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-surface-800 font-medium flex items-center gap-1.5">
                          <DeviceIcon size={12} className="text-surface-400" />
                          {d.name}
                        </span>
                        <span className="text-surface-500 text-xs">{d.count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-surface-400 text-center py-4">No device data yet</p>
            )}
          </div>

          {/* Recent Visits */}
          <div className="bg-white border border-surface-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock size={13} className="text-amber-500" />
              Recent Visits
            </h3>
            {analytics.recentVisits?.length > 0 ? (
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {analytics.recentVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="p-3 rounded-md bg-surface-50 border border-surface-200 text-xs"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-surface-800 font-medium">{visit.browser || 'Unknown'}</span>
                      <span className="text-surface-400">{visit.device || 'Desktop'}</span>
                    </div>
                    <span className="text-surface-400">{formatDateTime(visit.timestamp)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-surface-400 text-center py-4">No visits yet</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-6 border-t border-surface-200">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-surface-900 transition-colors"
          >
            <div className="w-6 h-6 rounded bg-surface-900 border border-surface-800 flex items-center justify-center">
              <Link2 size={12} className="text-white" />
            </div>
            Powered by LinkIQ
          </Link>
        </div>

      </div>
    </div>
  );
};

export default PublicStats;
