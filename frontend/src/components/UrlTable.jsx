import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Copy, Trash2, Edit3, QrCode, BarChart3,
  Check, Calendar, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import SafetyBadge from './SafetyBadge';

const UrlTable = ({ urls, onDelete, onEdit, onShowQR }) => {
  const [copiedId, setCopiedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleCopy = async (url) => {
    try {
      await navigator.clipboard.writeText(url.shortUrl);
      setCopiedId(url.id);
      toast.success('Short link copied!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDelete = async (url) => {
    setDeletingId(url.id);
    try {
      await onDelete(url.id);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });

  const getDomain = (urlStr) => {
    try { return new URL(urlStr).hostname.replace('www.', ''); }
    catch { return urlStr; }
  };

  return (
    <div className="bg-white border border-surface-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          {/* Header */}
          <thead>
            <tr className="border-b border-surface-100 bg-surface-50/80">
              <th className="px-5 py-3.5 text-[11px] font-semibold text-surface-500 uppercase tracking-wider">Link</th>
              <th className="px-5 py-3.5 text-[11px] font-semibold text-surface-500 uppercase tracking-wider">Performance</th>
              <th className="px-5 py-3.5 text-[11px] font-semibold text-surface-500 uppercase tracking-wider">Safety</th>
              <th className="px-5 py-3.5 text-[11px] font-semibold text-surface-500 uppercase tracking-wider">Created</th>
              <th className="px-5 py-3.5 text-[11px] font-semibold text-surface-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-surface-100">
            {urls.map((url) => {
              const isExpired = url.expiresAt && new Date(url.expiresAt) < new Date();
              const domain = getDomain(url.originalUrl);

              return (
                <tr
                  key={url.id}
                  className="hover:bg-blue-50 transition-colors group"
                >
                  {/* ── Link Column ── */}
                  <td className="px-5 py-3.5 max-w-[300px]">
                    <div className="flex flex-col gap-0.5">
                      {/* Domain + expired badge */}
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-surface-900 text-sm truncate" title={domain}>
                          {domain}
                        </span>
                        {isExpired && (
                          <span className="flex-shrink-0 text-[9px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-semibold border border-red-100">
                            Expired
                          </span>
                        )}
                      </div>
                      {/* Original URL */}
                      <span className="text-[11px] text-surface-400 truncate font-mono" title={url.originalUrl}>
                        {url.originalUrl}
                      </span>
                      {/* Short URL row */}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <a
                          href={url.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 font-mono hover:underline flex items-center gap-0.5"
                        >
                          {url.shortUrl}
                          <ExternalLink size={9} className="opacity-60" />
                        </a>
                        <button
                          onClick={() => handleCopy(url)}
                          title="Copy short link"
                          className="p-0.5 text-surface-400 hover:text-blue-600 transition-colors"
                        >
                          {copiedId === url.id
                            ? <Check size={11} className="text-emerald-500" />
                            : <Copy size={11} />}
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* ── Performance Column ── */}
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-surface-900 tabular-nums">
                        {url.clicks.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-surface-400 font-medium">
                        {url.clicks === 1 ? 'click' : 'clicks'}
                      </span>
                    </div>
                  </td>

                  {/* ── Safety Column ── */}
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col items-start gap-1">
                      <SafetyBadge score={url.safetyScore} status={url.safetyStatus} />
                      {url.expiresAt && !isExpired && (
                        <span className="text-[10px] text-surface-400 flex items-center gap-1">
                          <Calendar size={9} />
                          Expires {formatDate(url.expiresAt)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* ── Created Column ── */}
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-surface-500 font-medium whitespace-nowrap">
                      {formatDate(url.createdAt)}
                    </span>
                  </td>

                  {/* ── Actions Column ── */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-0.5">
                      {/* Analytics */}
                      <Link
                        to={`/analytics/${url.id}`}
                        title="Performance insights"
                        className="p-2 rounded-lg text-surface-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <BarChart3 size={14} />
                      </Link>

                      {/* QR Code */}
                      <button
                        onClick={() => onShowQR(url)}
                        title="Show QR code"
                        className="p-2 rounded-lg text-surface-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                      >
                        <QrCode size={14} />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => onEdit(url)}
                        title="Edit link"
                        className="p-2 rounded-lg text-surface-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(url)}
                        disabled={deletingId === url.id}
                        title="Delete link"
                        className="p-2 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UrlTable;
