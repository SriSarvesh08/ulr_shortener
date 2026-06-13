import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';
import ClickChart from '../components/ClickChart';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import SafetyBadge from '../components/SafetyBadge';
import SmartSummary from '../components/SmartSummary';
import {
  MousePointerClick, Clock, Globe, Monitor, Smartphone,
  ArrowLeft, ExternalLink, Copy, Check, BarChart3,
  Laptop, Tablet, Link2, HeartPulse, Heart, Download
} from 'lucide-react';
import toast from 'react-hot-toast';

const Analytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/urls/${id}/analytics`);
      setData(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('URL not found');
      } else {
        setError('Failed to load performance insights');
      }
      toast.error('Failed to load performance insights');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.url.shortUrl);
      setCopied(true);
      toast.success('Copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExportCSV = () => {
    if (!data?.analytics?.recentVisits?.length) {
      toast.error('No visits to export');
      return;
    }
    
    const headers = ['Timestamp', 'Browser', 'Device', 'OS', 'Country', 'City', 'IP Address'];
    const rows = data.analytics.recentVisits.map(v => [
      v.timestamp,
      v.browser || 'Unknown',
      v.device || 'Desktop',
      v.os || 'Unknown',
      v.country || 'Unknown',
      v.city || 'Unknown',
      v.ip || 'Unknown'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `analytics-${data.url.shortCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Heuristic Link Health Score Generator
  const calculateHealthScore = (url, analytics) => {
    let score = 70; // baseline

    // Safety Impact
    if (url.safetyStatus === 'clean') score += 20;
    else if (url.safetyStatus === 'suspicious') score -= 20;
    else if (url.safetyStatus === 'unsafe') score -= 50;

    // Click Volume Impact
    if (analytics.totalClicks > 100) score += 10;
    else if (analytics.totalClicks > 10) score += 5;
    else if (analytics.totalClicks === 0) score -= 15;

    // Expiry Status
    const isExpired = url.expiresAt && new Date(url.expiresAt) < new Date();
    if (isExpired) score -= 30;

    return Math.max(0, Math.min(100, score));
  };

  const getHealthStatus = (score) => {
    if (score >= 80) return { label: 'Healthy', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (score >= 50) return { label: 'Moderate', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'Needs Attention', color: 'text-red-700 bg-red-50 border-red-200' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <LoadingSpinner size="lg" text="Analyzing performance profiles..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="bg-white border border-surface-200 rounded-lg p-8 text-center max-w-md shadow-sm">
          <h2 className="text-xl font-bold text-surface-900 mb-2">Analysis Failed</h2>
          <p className="text-surface-500 mb-6">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { url, analytics } = data;
  const healthScore = calculateHealthScore(url, analytics);
  const healthStatus = getHealthStatus(healthScore);

  return (
    <div className="pb-10 font-sans">
      
      {/* Header section */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-surface-500 hover:text-surface-900 transition-colors mb-2"
          >
            <ArrowLeft size={16} />
            Back to Hub
          </Link>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
            Performance Insights
          </h1>
        </div>
        
        <button
          onClick={handleCopy}
          className="btn-secondary flex items-center gap-2"
        >
          {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy Short URL'}
        </button>
      </div>

      {/* URL Info Card */}
      <div className="bg-white border border-surface-200 rounded-lg p-5 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <a
              href={url.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-mono text-base font-semibold flex items-center gap-2 transition-colors"
            >
              {url.shortUrl}
              <ExternalLink size={14} className="text-surface-400" />
            </a>
          </div>
          <p className="text-surface-500 text-sm truncate font-mono" title={url.originalUrl}>
            {url.originalUrl}
          </p>
        </div>
        
        <div className="flex items-center gap-3 flex-shrink-0">
          <SafetyBadge score={url.safetyScore} status={url.safetyStatus} />
        </div>
      </div>

      {/* Health Score & Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Health Widget */}
        <div className="lg:col-span-1 bg-white border border-surface-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider">Link Health Score</h3>
            <Heart size={16} className="text-red-500 fill-red-50" />
          </div>
          
          <div className="flex flex-col items-center py-4">
            <div className="relative flex items-center justify-center">
              {/* Outer Score Circle */}
              <div className="w-24 h-24 rounded-full border-4 border-surface-100 flex items-center justify-center">
                <span className="text-3xl font-extrabold text-surface-900 tracking-tight">{healthScore}</span>
              </div>
            </div>
            
            <span className={`mt-4 px-3 py-1 text-xs font-bold rounded-full border ${healthStatus.color}`}>
              {healthStatus.label}
            </span>
          </div>
          
          <p className="text-xs text-surface-400 text-center leading-relaxed">
            Derived from redirect latency parameters, safety index flags, and click volumes.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatsCard label="Total Engagement" value={analytics.totalClicks} />
          <StatsCard 
            label="Last Visited" 
            value={analytics.lastVisited ? formatDateTime(analytics.lastVisited).split(',')[0] : 'Never'}
            subValue={analytics.lastVisited ? formatDateTime(analytics.lastVisited).split(',')[1] : null}
          />
          <StatsCard label="Unique Browsers" value={analytics.browserStats?.length || 0} />
          <StatsCard label="Device Types" value={analytics.deviceStats?.length || 0} />
        </div>

      </div>

      {/* Chart */}
      <div className="bg-white border border-surface-200 rounded-lg p-6 mb-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-surface-900">Daily Clicks</h2>
          <span className="text-xs font-medium px-2 py-1 bg-surface-50 border border-surface-200 text-surface-500 rounded">Last 30 Days</span>
        </div>
        <ClickChart data={analytics.dailyClicks} height={300} />
      </div>

      {/* Bottom grid: Browser & Device stats + Recent visits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Browser & Device Column */}
        <div className="space-y-6 lg:col-span-1">
          {/* Browser stats */}
          <div className="bg-white border border-surface-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-4">Browsers</h3>
            {analytics.browserStats?.length > 0 ? (
              <div className="space-y-3">
                {analytics.browserStats.map((b, i) => {
                  const percent = analytics.totalClicks > 0 ? Math.round((b.count / analytics.totalClicks) * 100) : 0;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-surface-800 font-medium">{b.name}</span>
                        <span className="text-surface-500 text-xs">{b.count} ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-surface-500 text-center py-2">No browser stats recorded</p>
            )}
          </div>

          {/* Device stats */}
          <div className="bg-white border border-surface-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-4">Devices</h3>
            {analytics.deviceStats?.length > 0 ? (
              <div className="space-y-3">
                {analytics.deviceStats.map((d, i) => {
                  const percent = analytics.totalClicks > 0 ? Math.round((d.count / analytics.totalClicks) * 100) : 0;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-surface-800 font-medium">{d.name}</span>
                        <span className="text-surface-500 text-xs">{d.count} ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-surface-500 text-center py-2">No device stats recorded</p>
            )}
          </div>
        </div>

        {/* Geography & Visits Column */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Geography Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Top Countries */}
            <div className="bg-white border border-surface-200 rounded-lg p-5 shadow-sm">
              <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-4">Top Countries</h3>
              {analytics.countryStats?.length > 0 ? (
                <div className="space-y-3">
                  {analytics.countryStats.map((c, i) => {
                    const percent = analytics.totalClicks > 0 ? Math.round((c.count / analytics.totalClicks) * 100) : 0;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-surface-800 font-medium">{c.name}</span>
                          <span className="text-surface-500 text-xs">{c.count} ({percent}%)</span>
                        </div>
                        <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-surface-500 text-center py-2">No location data</p>
              )}
            </div>

            {/* Top Cities */}
            <div className="bg-white border border-surface-200 rounded-lg p-5 shadow-sm">
              <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-4">Top Cities</h3>
              {analytics.cityStats?.length > 0 ? (
                <div className="space-y-3">
                  {analytics.cityStats.map((c, i) => {
                    const percent = analytics.totalClicks > 0 ? Math.round((c.count / analytics.totalClicks) * 100) : 0;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-surface-800 font-medium">{c.name}</span>
                          <span className="text-surface-500 text-xs">{c.count} ({percent}%)</span>
                        </div>
                        <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-surface-500 text-center py-2">No location data</p>
              )}
            </div>
          </div>

          {/* Recent Visits Table */}
          <div className="bg-white border border-surface-200 rounded-lg flex flex-col shadow-sm">
            <div className="p-5 border-b border-surface-200 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Recent Visits</h3>
              <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2 text-xs py-1.5 px-3">
                <Download size={13} /> Export CSV
              </button>
            </div>
            
            <div className="flex-1 overflow-auto max-h-[400px]">
              {analytics.recentVisits?.length > 0 ? (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-surface-50 text-surface-500 text-xs border-b border-surface-200 sticky top-0">
                    <tr>
                      <th className="px-5 py-2.5 font-medium">Time</th>
                      <th className="px-5 py-2.5 font-medium">Location</th>
                      <th className="px-5 py-2.5 font-medium">System</th>
                      <th className="px-5 py-2.5 font-medium text-right">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-200">
                    {analytics.recentVisits.slice(0, 15).map((visit) => {
                      const isLocalhost = visit.ip === '::1' || visit.ip === '127.0.0.1';
                      const locationDisplay = isLocalhost 
                        ? 'Local Network' 
                        : (visit.city && visit.country ? `${visit.city}, ${visit.country}` : visit.country || 'Unknown');
                        
                      return (
                        <tr key={visit.id} className="hover:bg-surface-50 text-surface-700">
                          <td className="px-5 py-2.5 text-xs text-surface-500">{formatDateTime(visit.timestamp)}</td>
                          <td className="px-5 py-2.5 text-xs">
                            {locationDisplay}
                          </td>
                          <td className="px-5 py-2.5 text-xs text-surface-600">
                            {visit.browser || 'Unknown'} • {visit.device || 'Desktop'}
                          </td>
                          <td className="px-5 py-2.5 font-mono text-xs text-right text-surface-400">{visit.ip}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="flex items-center justify-center py-10">
                  <p className="text-sm text-surface-500">No visits recorded</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Insights & Recommendations Panel */}
      {analytics.smartSummary && analytics.smartSummary.length > 0 && (
        <div className="border border-surface-200 rounded-lg p-1 shadow-sm bg-white overflow-hidden">
          <div className="p-4 border-b border-surface-150">
            <h3 className="text-sm font-bold text-surface-900">Insights & Recommendations</h3>
            <p className="text-xs text-surface-500 mt-0.5">Calculated link optimizations based on visitor trends.</p>
          </div>
          <SmartSummary insights={analytics.smartSummary} />
        </div>
      )}

    </div>
  );
};

export default Analytics;
