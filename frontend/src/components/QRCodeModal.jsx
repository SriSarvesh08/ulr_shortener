import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const QRCodeModal = ({ isOpen, onClose, url }) => {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  if (!isOpen || !url) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url.shortUrl);
      setCopied(true);
      toast.success('URL copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 1024;
      canvas.height = 1024;

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw QR code centered
      const padding = 64;
      ctx.drawImage(img, padding, padding, canvas.width - padding * 2, canvas.height - padding * 2);

      // Download
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `qr-${url.shortCode}.png`;
      link.href = pngUrl;
      link.click();

      toast.success('QR Code downloaded!');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm glass-card p-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-surface-900">QR Code</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* QR Code */}
        <div
          ref={qrRef}
          className="flex justify-center mb-4 p-6 bg-white border border-surface-150 rounded-xl shadow-inner"
        >
          <QRCodeSVG
            value={url.shortUrl}
            size={220}
            level="H"
            includeMargin={false}
            bgColor="#ffffff"
            fgColor="#18181b"
          />
        </div>

        {/* Short URL display */}
        <div className="text-center mb-5">
          <p className="text-sm font-mono text-blue-600 break-all">{url.shortUrl}</p>
          <p className="text-xs text-surface-500 mt-1 truncate">{url.originalUrl}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={handleDownload} className="btn-primary flex-1 flex items-center justify-center gap-2 !py-2.5">
            <Download size={16} />
            Download PNG
          </button>
          <button
            onClick={handleCopy}
            className={`btn-secondary flex items-center justify-center gap-2 !py-2.5 ${
              copied ? '!bg-emerald-50 !border-emerald-200 !text-emerald-700' : ''
            }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
