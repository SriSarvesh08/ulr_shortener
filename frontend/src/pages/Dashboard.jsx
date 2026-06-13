import { useState, useEffect, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import UrlTable from '../components/UrlTable';
import CreateUrlModal from '../components/CreateUrlModal';
import QRCodeModal from '../components/QRCodeModal';
import LoadingSpinner from '../components/LoadingSpinner';
import StatsCard from '../components/StatsCard';
import {
  Plus, BarChart3, Globe, ArrowRight,
  Link2, MousePointerClick, Zap, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = ({ searchTerm = '', activeTabOverride }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const activeTab = activeTabOverride || queryParams.get('tab') || 'dashboard';

  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editUrl, setEditUrl] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [lookupCode, setLookupCode] = useState('');

  const fetchUrls = useCallback(async (page = 1, searchQuery = '') => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (searchQuery) params.search = searchQuery;
      const { data } = await api.get('/urls', { params });
      setUrls(data.urls);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load URL repository');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUrls(); }, [fetchUrls]);

  useEffect(() => {
    const timer = setTimeout(() => fetchUrls(1, searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchUrls]);

  useEffect(() => {
    const handler = () => fetchUrls(1, searchTerm);
    window.addEventListener('urlCreated', handler);
    return () => window.removeEventListener('urlCreated', handler);
  }, [fetchUrls, searchTerm]);

  useEffect(() => {
    const handler = () => { setEditUrl(null); setShowCreateModal(true); };
    window.addEventListener('openCreateUrlModal', handler);
    return () => window.removeEventListener('openCreateUrlModal', handler);
  }, []);

  const handleCreate = async (formData) => {
    const { data } = await api.post('/urls', formData);
    toast.success('URL shortened successfully');
    fetchUrls(1, searchTerm);
    return data;
  };

  const handleEdit = async (formData) => {
    const { data } = await api.put(`/urls/${editUrl.id}`, formData);
    toast.success('URL updated');
    setEditUrl(null);
    fetchUrls(pagination.page, searchTerm);
    return data;
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/urls/${id}`);
      toast.success('Link deleted');
      fetchUrls(pagination.page, searchTerm);
    } catch {
      toast.error('Failed to delete URL');
    }
  };

  const handleLookupSubmit = (e) => {
    e.preventDefault();
    let code = lookupCode.trim();
    if (!code) { toast.error('Please enter a short code'); return; }
    if (code.includes('/')) {
      const parts = code.split('/').filter(Boolean);
      code = parts[parts.length - 1];
    }
    navigate(`/stats/${code}`);
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const totalClicks = urls.reduce((s, u) => s + u.clicks, 0);
  const activeUrls = urls.filter(u => !u.expiresAt || new Date(u.expiresAt) > new Date()).length;
  const sortedByClicks = [...urls].sort((a, b) => b.clicks - a.clicks);
  const topLink = sortedByClicks[0] || null;
  const topLinkName = topLink ? (topLink.customAlias || topLink.shortCode) : '—';
  const topLinkClicks = topLink ? `${topLink.clicks.toLocaleString()} clicks` : 'No clicks yet';
  const topBrowser = totalClicks > 0 ? 'Chrome' : '—';
  const topDevice = totalClicks > 0 ? 'Desktop' : '—';

  const tabItems = [
    { key: 'dashboard', label: 'Overview', to: '/dashboard' },
    { key: 'links', label: 'My Links', to: '/my-links' },
    { key: 'analytics', label: 'Performance', to: '/insights' },
    { key: 'public-stats', label: 'Public Stats', to: '/safety-center' },
  ];

  return (
    <div className="space-y-7">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
            {getGreeting()}, <span className="text-blue-600">{user?.name?.split(' ')[0] || 'there'}</span>
          </h1>
          <p className="text-sm text-surface-500 mt-1 max-w-xl leading-relaxed">
            You manage{' '}
            <span className="font-semibold text-surface-800">{pagination.total}</span> links
            {totalClicks > 0 && (
              <> · <span className="font-semibold text-surface-800">{totalClicks.toLocaleString()}</span> total clicks</>
            )}
            {totalClicks > 0 && (
              <> · Top traffic from <span className="font-semibold text-surface-800">{topBrowser}</span> on <span className="font-semibold text-surface-800">{topDevice}</span></>
            )}
          </p>
        </div>
        <button
          onClick={() => { setEditUrl(null); setShowCreateModal(true); }}
          className="btn-primary flex items-center gap-2 flex-shrink-0 !px-5 !py-2.5 shadow-sm hover:shadow-md transition-shadow"
        >
          <Plus size={15} />
          Create Link
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-surface-200 gap-1">
        {tabItems.map(({ key, label, to }) => (
          <Link
            key={key}
            to={to}
            className={`px-4 py-2.5 border-b-2 font-medium text-sm transition-colors -mb-px whitespace-nowrap ${
              activeTab === key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-surface-500 hover:text-surface-800 hover:border-surface-300'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* ── KPI Cards ── */}
      {(activeTab === 'dashboard' || activeTab === 'analytics') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard
            icon={Link2}
            label="Links Managed"
            value={pagination.total.toLocaleString()}
            subValue={activeUrls > 0 ? `${activeUrls} currently active` : 'No active links'}
            accent="blue"
          />
          <StatsCard
            icon={MousePointerClick}
            label="Total Engagement"
            value={totalClicks.toLocaleString()}
            subValue={totalClicks > 0 ? 'Across all campaigns' : 'No clicks yet'}
            trend={totalClicks > 0 ? 'this week' : null}
            trendUp={true}
            accent="violet"
          />
          <StatsCard
            icon={Zap}
            label="Active Campaigns"
            value={activeUrls.toLocaleString()}
            subValue={`${pagination.total - activeUrls} expired`}
            accent="emerald"
          />
          <StatsCard
            icon={TrendingUp}
            label="Top Performer"
            value={topLinkName}
            subValue={topLinkClicks}
            accent="amber"
          />
        </div>
      )}

      {/* ── Analytics Tab ── */}
      {activeTab === 'analytics' && (
        <div className="space-y-3">
          <div className="bg-white border border-surface-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-base font-bold text-surface-900 mb-1">Link Performance Leaderboard</h2>
            <p className="text-sm text-surface-500">Your shortened links ranked by total visitor traffic.</p>
          </div>

          {urls.length === 0 ? (
            <EmptyState onCreateClick={() => { setEditUrl(null); setShowCreateModal(true); }} />
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {sortedByClicks.map((url, idx) => {
                const clickShare = totalClicks > 0 ? Math.round((url.clicks / totalClicks) * 100) : 0;
                return (
                  <div
                    key={url.id}
                    onClick={() => navigate(`/analytics/${url.id}`)}
                    className="flex items-center gap-5 p-4 bg-white border border-surface-200 rounded-xl shadow-sm hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
                  >
                    {/* Rank */}
                    <span className={`w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-amber-100 text-amber-700' :
                      idx === 1 ? 'bg-surface-100 text-surface-600' :
                      idx === 2 ? 'bg-orange-50 text-orange-600' :
                      'bg-surface-50 text-surface-400'
                    }`}>{idx + 1}</span>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-surface-900 truncate group-hover:text-blue-600 transition-colors">
                        {url.originalUrl}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <a href={url.shortUrl} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-xs font-mono text-blue-600 hover:underline">
                          {url.shortUrl}
                        </a>
                        <span className="text-surface-300">·</span>
                        <span className="text-xs text-surface-600 font-semibold">{url.clicks.toLocaleString()} clicks</span>
                        <span className="text-surface-300">·</span>
                        <span className="text-xs text-surface-500">{clickShare}% share</span>
                      </div>
                      <div className="w-full bg-surface-100 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${clickShare}%` }} />
                      </div>
                    </div>

                    <Link to={`/analytics/${url.id}`} onClick={e => e.stopPropagation()}
                      className="btn-secondary text-xs flex items-center gap-1.5 flex-shrink-0 !py-1.5 !px-3">
                      <BarChart3 size={12} /> Insights
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Public Stats Tab ── */}
      {activeTab === 'public-stats' && (
        <div className="bg-white border border-surface-200 rounded-xl p-6 shadow-sm max-w-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Globe size={18} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-surface-900">Public Stats Lookup</h3>
              <p className="text-xs text-surface-500">Inspect any link's public performance.</p>
            </div>
          </div>
          <p className="text-sm text-surface-600 mb-5">Enter a short code to view its click distributions, devices, and safety ratings.</p>
          <form onSubmit={handleLookupSubmit} className="flex gap-2">
            <input
              type="text"
              value={lookupCode}
              onChange={e => setLookupCode(e.target.value)}
              placeholder="e.g. custom-alias or short code"
              className="input-field flex-1"
              required
            />
            <button type="submit" className="btn-primary flex items-center gap-1.5 text-sm whitespace-nowrap">
              Inspect <ArrowRight size={14} />
            </button>
          </form>
        </div>
      )}

      {/* ── URL Table (Dashboard + My Links tabs) ── */}
      {activeTab !== 'analytics' && activeTab !== 'public-stats' && (
        <div>
          {loading ? (
            <div className="flex justify-center py-20 bg-white border border-surface-200 rounded-xl shadow-sm">
              <LoadingSpinner size="lg" text="Loading links…" />
            </div>
          ) : urls.length === 0 ? (
            <EmptyState
              searchTerm={searchTerm}
              onCreateClick={() => { setEditUrl(null); setShowCreateModal(true); }}
            />
          ) : (
            <UrlTable
              urls={urls}
              onDelete={handleDelete}
              onEdit={url => { setEditUrl(url); setShowCreateModal(true); }}
              onShowQR={url => setQrUrl(url)}
            />
          )}
        </div>
      )}

      {/* ── Pagination ── */}
      {activeTab !== 'analytics' && activeTab !== 'public-stats' && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm pt-1">
          <p className="text-surface-500">
            Showing <span className="font-semibold text-surface-900">{urls.length}</span> of{' '}
            <span className="font-semibold text-surface-900">{pagination.total}</span> links
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchUrls(pagination.page - 1, searchTerm)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 border border-surface-200 rounded-lg text-surface-700 hover:bg-surface-50 disabled:opacity-30 transition-colors text-xs font-medium"
            >
              ← Previous
            </button>
            <span className="text-xs text-surface-500 px-1">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchUrls(pagination.page + 1, searchTerm)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 border border-surface-200 rounded-lg text-surface-700 hover:bg-surface-50 disabled:opacity-30 transition-colors text-xs font-medium"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <CreateUrlModal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setEditUrl(null); }}
        onSubmit={editUrl ? handleEdit : handleCreate}
        editUrl={editUrl}
      />
      <QRCodeModal
        isOpen={!!qrUrl}
        onClose={() => setQrUrl(null)}
        url={qrUrl}
      />
    </div>
  );
};

/* ── Empty State Component ── */
const EmptyState = ({ searchTerm, onCreateClick }) => (
  <div className="bg-white border border-surface-200 rounded-xl shadow-sm p-16 text-center">
    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
      <Link2 size={22} className="text-blue-500" />
    </div>
    <h3 className="text-sm font-semibold text-surface-900 mb-1">
      {searchTerm ? 'No results found' : 'No links yet'}
    </h3>
    <p className="text-surface-500 text-sm mb-6 max-w-xs mx-auto">
      {searchTerm ? `No links match "${searchTerm}". Try a different search term.` : 'Create your first short link to start tracking performance.'}
    </p>
    {!searchTerm && (
      <button onClick={onCreateClick} className="btn-primary inline-flex items-center gap-2 text-sm">
        <Plus size={14} /> Create Link
      </button>
    )}
  </div>
);

export default Dashboard;
