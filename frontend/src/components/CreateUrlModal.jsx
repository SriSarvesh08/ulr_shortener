import { useState, useEffect } from 'react';
import { X, Link2, Tag, Calendar, Loader2 } from 'lucide-react';
import LinkPreviewCard from './LinkPreviewCard';

const CreateUrlModal = ({ isOpen, onClose, onSubmit, editUrl = null }) => {
  const [formData, setFormData] = useState({
    originalUrl: '',
    customAlias: '',
    expiresAt: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editUrl) {
      setFormData({
        originalUrl: editUrl.originalUrl || '',
        customAlias: editUrl.customAlias || '',
        expiresAt: editUrl.expiresAt ? new Date(editUrl.expiresAt).toISOString().split('T')[0] : '',
      });
    } else {
      setFormData({ originalUrl: '', customAlias: '', expiresAt: '' });
    }
    setErrors({});
  }, [editUrl, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.originalUrl.trim()) {
      newErrors.originalUrl = 'URL is required';
    } else {
      try {
        const url = new URL(formData.originalUrl);
        if (!['http:', 'https:'].includes(url.protocol)) {
          newErrors.originalUrl = 'URL must start with http:// or https://';
        }
      } catch {
        newErrors.originalUrl = 'Please enter a valid URL';
      }
    }

    if (formData.customAlias && !/^[a-zA-Z0-9_-]{3,30}$/.test(formData.customAlias)) {
      newErrors.customAlias = 'Alias must be 3-30 chars: letters, numbers, hyphens, underscores';
    }

    if (formData.expiresAt && new Date(formData.expiresAt) <= new Date()) {
      newErrors.expiresAt = 'Expiry date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit({
        originalUrl: formData.originalUrl.trim(),
        customAlias: formData.customAlias.trim() || undefined,
        expiresAt: formData.expiresAt || undefined,
      });
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong';
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg glass-card p-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-surface-900">
            {editUrl ? 'Edit URL' : 'Shorten a URL'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Original URL */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-surface-700 mb-2">
              <Link2 size={14} className="text-blue-600" />
              Destination URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.originalUrl}
              onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
              placeholder="https://example.com/your-long-url"
              className={`input-field ${errors.originalUrl ? 'border-red-500 focus:ring-red-500' : ''}`}
              autoFocus
            />
            {errors.originalUrl && (
              <p className="mt-1.5 text-xs text-red-500">{errors.originalUrl}</p>
            )}
            {/* Link Preview Card — live URL analysis */}
            {!editUrl && <LinkPreviewCard url={formData.originalUrl} />}
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
                value={formData.customAlias}
                onChange={(e) => setFormData({ ...formData, customAlias: e.target.value })}
                placeholder="my-custom-link"
                className={`input-field !rounded-l-none ${errors.customAlias ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.customAlias && (
              <p className="mt-1.5 text-xs text-red-500">{errors.customAlias}</p>
            )}
          </div>

          {/* Expiry Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-surface-700 mb-2">
              <Calendar size={14} className="text-accent-amber" />
              Expiry Date <span className="text-surface-400 text-xs">(optional)</span>
            </label>
            <input
              type="date"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className={`input-field ${errors.expiresAt ? 'border-red-500' : ''}`}
            />
            {errors.expiresAt && (
              <p className="mt-1.5 text-xs text-red-500">{errors.expiresAt}</p>
            )}
          </div>

          {/* Submit error */}
          {errors.submit && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {editUrl ? 'Updating...' : 'Shortening...'}
                </>
              ) : (
                editUrl ? 'Update URL' : 'Shorten URL'
              )}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUrlModal;
