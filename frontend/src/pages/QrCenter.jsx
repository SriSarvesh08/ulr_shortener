import { useState, useEffect, useRef } from 'react';
import { QrCode, Download, Link2, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const QrCenter = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        setLoading(true);
        // Fetch up to 50 latest links to display their QR codes
        const { data } = await api.get('/urls', { params: { limit: 50, page: 1 } });
        setUrls(data.urls || []);
      } catch (err) {
        toast.error('Failed to load URLs for QR generation');
      } finally {
        setLoading(false);
      }
    };
    fetchUrls();
  }, []);

  const handleDownload = (id, alias) => {
    const svg = document.getElementById(`qr-${id}`);
    if (!svg) return;
    
    // Create a canvas to draw the SVG, then download as PNG
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const DOMURL = window.URL || window.webkitURL || window;
    const url = DOMURL.createObjectURL(blob);
    
    img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      DOMURL.revokeObjectURL(url);
      
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `qr-${alias}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    img.src = url;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">QR Center</h1>
          <p className="text-sm text-surface-500 mt-1 max-w-2xl">
            Auto-generated QR codes for all your shortened links. Ready to download and share.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 bg-white border border-surface-200 rounded-lg shadow-sm">
          <LoadingSpinner size="lg" text="Generating QR Codes..." />
        </div>
      ) : urls.length === 0 ? (
        <div className="bg-white border border-surface-200 rounded-lg shadow-sm p-12 text-center">
          <div className="mx-auto w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
            <QrCode size={24} className="text-purple-600" />
          </div>
          <h3 className="text-sm font-semibold text-surface-900 mb-1">No links found</h3>
          <p className="text-surface-500 text-sm mb-6">
            Create your first short link to automatically generate a QR code.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {urls.map((url) => {
            const displayName = url.customAlias || url.shortCode;
            return (
              <div key={url.id} className="bg-white border border-surface-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-surface-300 transition-all group flex flex-col items-center">
                
                {/* QR Code container */}
                <div className="bg-surface-50 p-4 rounded-lg border border-surface-200 mb-4 flex items-center justify-center">
                  <QRCodeSVG 
                    id={`qr-${url.id}`}
                    value={url.shortUrl} 
                    size={160}
                    level="H"
                    includeMargin={true}
                    className="w-full h-auto"
                  />
                </div>

                <div className="w-full text-center mb-4">
                  <h3 className="text-sm font-bold text-surface-900 truncate" title={displayName}>
                    /{displayName}
                  </h3>
                  <a href={url.originalUrl} target="_blank" rel="noreferrer" className="text-xs text-surface-500 truncate block mt-0.5 hover:text-blue-600 transition-colors" title={url.originalUrl}>
                    {url.originalUrl}
                  </a>
                </div>

                <div className="mt-auto w-full flex gap-2">
                  <a
                    href={url.shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 btn-secondary text-xs flex items-center justify-center gap-1.5 !py-2"
                  >
                    <ExternalLink size={14} />
                    Visit
                  </a>
                  <button
                    onClick={() => handleDownload(url.id, displayName)}
                    className="flex-1 btn-primary text-xs flex items-center justify-center gap-1.5 !py-2"
                  >
                    <Download size={14} />
                    Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QrCenter;
