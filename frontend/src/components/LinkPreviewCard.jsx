import { useState, useEffect } from 'react';
import api from '../lib/axios';
import SafetyBadge from './SafetyBadge';
import { Globe, AlertTriangle, Loader2, CheckCircle2, XCircle } from 'lucide-react';

const LinkPreviewCard = ({ url }) => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url || url.trim().length < 10) {
      setPreview(null);
      setError(null);
      return;
    }

    // Validate URL format first
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        setPreview(null);
        return;
      }
    } catch {
      setPreview(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.post('/preview', { url });
        setPreview(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to analyze URL');
        setPreview(null);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [url]);

  if (!url || url.trim().length < 10) return null;

  if (loading) {
    return (
      <div className="mt-3 p-4 rounded-xl bg-surface-50 border border-surface-200 animate-fade-in">
        <div className="flex items-center gap-2 text-surface-600 text-sm">
          <Loader2 size={14} className="animate-spin" />
          Analyzing URL safety...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20 animate-fade-in">
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <XCircle size={14} />
          {error}
        </div>
      </div>
    );
  }

  if (!preview) return null;

  const scoreBarWidth = `${preview.safetyScore}%`;
  const scoreBarColor =
    preview.safetyScore >= 70
      ? 'bg-emerald-500'
      : preview.safetyScore >= 40
      ? 'bg-amber-500'
      : 'bg-red-500';

  return (
    <div className="mt-3 p-4 rounded-xl bg-surface-50 border border-surface-200 animate-scale-in">
      {/* Domain + Safety Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white border border-surface-200 flex items-center justify-center">
            <Globe size={14} className="text-surface-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-surface-900">{preview.domain}</p>
            <p className="text-[10px] text-surface-500 uppercase tracking-wider">Domain</p>
          </div>
        </div>
        <SafetyBadge score={preview.safetyScore} status={preview.safetyStatus} showScore size="md" />
      </div>

      {/* Score Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-surface-500 uppercase tracking-wider">Safety Score</span>
          <span className="text-xs font-mono text-surface-400">{preview.safetyScore}/100</span>
        </div>
        <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${scoreBarColor}`}
            style={{ width: scoreBarWidth }}
          />
        </div>
      </div>

      {/* Risks */}
      {preview.risks && preview.risks.length > 0 ? (
        <div className="space-y-1.5">
          {preview.risks.map((risk, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <AlertTriangle size={11} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-surface-700 font-medium">{risk.rule}</span>
                <span className="text-surface-500"> — {risk.detail}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <CheckCircle2 size={12} />
          No risks detected — URL looks safe
        </div>
      )}
    </div>
  );
};

export default LinkPreviewCard;
