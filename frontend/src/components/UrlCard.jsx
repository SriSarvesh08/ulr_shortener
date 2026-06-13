import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Copy, Trash2, Edit3, QrCode, BarChart3, ExternalLink,
  Clock, MousePointerClick, Check, Calendar, Globe, Share2
} from 'lucide-react';
import toast from 'react-hot-toast';
import SafetyBadge from './SafetyBadge';

const UrlCard = ({ url, onDelete, onEdit, onShowQR, index = 0 }) => {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url.shortUrl);
      setCopied(true);
      toast.success('Short URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy URL');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this URL? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      await onDelete(url.id);
    } catch {
      setDeleting(false);
    }
  };

  const isExpired = url.expiresAt && new Date(url.expiresAt) < new Date();

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      className={`glass-card-hover p-5 animate-slide-up ${deleting ? 'opacity-50 pointer-events-none' : ''}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          {/* Short URL */}
          <div className="flex items-center gap-2 mb-1.5">
            <a
              href={url.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-mono font-semibold text-sm transition-colors truncate"
            >
              {url.shortUrl}
            </a>
            <ExternalLink size={13} className="text-surface-500 flex-shrink-0" />
          </div>

          {/* Original URL */}
          <p className="text-surface-400 text-sm truncate max-w-md" title={url.originalUrl}>
            {url.originalUrl}
          </p>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <SafetyBadge score={url.safetyScore} status={url.safetyStatus} />
          {isExpired ? (
            <span className="badge-danger">Expired</span>
          ) : url.expiresAt ? (
            <span className="badge-warning">
              <Calendar size={10} className="mr-1" />
              Expires {formatDate(url.expiresAt)}
            </span>
          ) : (
            <span className="badge-success">Active</span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-4 text-xs text-surface-500">
        <span className="flex items-center gap-1.5">
          <MousePointerClick size={13} className="text-blue-600" />
          <span className="font-medium text-surface-700">{url.clicks}</span> clicks
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={13} />
          Created {formatDate(url.createdAt)}
        </span>
        {url.customAlias && (
          <span className="badge-primary text-[10px]">Custom: {url.customAlias}</span>
        )}
        {url.domain && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-100 border border-surface-200 text-[10px] text-surface-600">
            <Globe size={9} />
            {url.domain}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
            copied
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              : 'bg-white text-surface-600 border border-surface-200 hover:border-blue-300 hover:text-blue-600'
          }`}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>

        <button
          onClick={() => onEdit(url)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-surface-600 border border-surface-200 hover:border-blue-300 hover:text-blue-600 transition-all duration-300"
        >
          <Edit3 size={13} />
          Edit
        </button>

        <button
          onClick={() => onShowQR(url)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-surface-600 border border-surface-200 hover:border-blue-300 hover:text-blue-600 transition-all duration-300"
        >
          <QrCode size={13} />
          QR Code
        </button>

        <Link
          to={`/analytics/${url.id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-surface-600 border border-surface-200 hover:border-emerald-300 hover:text-emerald-600 transition-all duration-300"
        >
          <BarChart3 size={13} />
          Analytics
        </Link>

        <Link
          to={`/stats/${url.shortCode}`}
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-surface-600 border border-surface-200 hover:border-purple-300 hover:text-purple-600 transition-all duration-300"
        >
          <Share2 size={13} />
          Public Stats
        </Link>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-red-500 border border-surface-200 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all duration-300 ml-auto"
        >
          <Trash2 size={13} />
          Delete
        </button>
      </div>
    </div>
  );
};

export default UrlCard;
