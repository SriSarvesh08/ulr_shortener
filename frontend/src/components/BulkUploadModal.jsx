import { useState, useRef } from 'react';
import {
  X, Upload, FileSpreadsheet, Loader2, CheckCircle2,
  XCircle, AlertTriangle, Download, Eye
} from 'lucide-react';
import Papa from 'papaparse';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const BulkUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const fileInputRef = useRef(null);
  const [step, setStep] = useState('upload'); // upload | preview | uploading | results
  const [parsedRows, setParsedRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const resetState = () => {
    setStep('upload');
    setParsedRows([]);
    setFileName('');
    setResults(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = [];
          results.data.forEach((row) => {
            // Map header columns dynamically to handle casing/spacing
            let url = '', customAlias = '', expiryDate = '';
            for (const key in row) {
              const lowerKey = key.toLowerCase().replace(/\s/g, '');
              if (lowerKey.includes('url') || lowerKey.includes('link') || lowerKey.includes('http')) {
                url = row[key].trim();
              } else if (lowerKey.includes('alias') || lowerKey.includes('custom')) {
                customAlias = row[key].trim();
              } else if (lowerKey.includes('expiry') || lowerKey.includes('date')) {
                expiryDate = row[key].trim();
              }
            }
            if (url) {
              rows.push({ url, customAlias, expiryDate });
            }
          });
          resolve(rows);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setError('Please select a CSV file (.csv or .txt)');
      return;
    }

    if (file.size > 1024 * 1024) {
      setError('File is too large. Maximum 1MB.');
      return;
    }

    setError(null);
    setFileName(file.name);

    try {
      const rows = await parseCSV(file);
      if (rows.length === 0) {
        setError('No valid URLs found in the CSV file.');
        return;
      }
      if (rows.length > 100) {
        setError('Maximum 100 URLs per upload. Your file has ' + rows.length + ' rows.');
        return;
      }
      setParsedRows(rows);
      setStep('preview');
    } catch {
      setError('Failed to parse CSV file. Please check the format.');
    }
  };

  const handleUpload = async () => {
    setStep('uploading');
    setError(null);

    try {
      const { data } = await api.post('/urls/bulk-create', {
        urls: parsedRows,
      });

      setResults(data);
      setStep('results');

      if (data.successCount > 0) {
        toast.success(`${data.successCount} URLs shortened successfully!`);
        onSuccess();
      }
      if (data.failedCount > 0) {
        toast.error(`${data.failedCount} URLs failed.`);
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Bulk upload failed';
      setError(msg);
      setStep('preview');
      toast.error(msg);
    }
  };

  const downloadSampleCSV = () => {
    const csv = `url,customAlias,expiryDate\nhttps://google.com,google-link,2026-12-31\nhttps://github.com,github-link,2026-12-31\nhttps://stackoverflow.com,,\nhttps://react.dev,react-docs,`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.download = 'sample-urls.csv';
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={handleClose} />

      <div className="relative w-full max-w-2xl glass-card p-6 animate-scale-in max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-shrink-0">
          <h2 className="text-xl font-bold text-surface-900 flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-blue-600" />
            Bulk URL Upload
          </h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-900 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Step: Upload */}
        {step === 'upload' && (
          <div className="space-y-4">
            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-surface-250 hover:border-blue-400 rounded-xl p-10 text-center cursor-pointer transition-all duration-300 hover:bg-blue-50/20"
            >
              <Upload size={32} className="text-surface-400 mx-auto mb-3" />
              <p className="text-surface-700 font-medium mb-1">Click to select a CSV file</p>
              <p className="text-xs text-surface-500">Maximum 100 URLs per file, 1MB limit</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* CSV Format */}
            <div className="p-4 rounded-xl bg-surface-50 border border-surface-200">
              <p className="text-xs font-semibold text-surface-800 mb-2">Expected CSV format:</p>
              <code className="text-xs text-blue-600 font-mono block whitespace-pre leading-relaxed">
                url,customAlias,expiryDate{'\n'}
                https://google.com,google-link,2026-12-31{'\n'}
                https://github.com,,{'\n'}
              </code>
              <p className="text-[10px] text-surface-500 mt-2">
                • <strong>url</strong> is required. <strong>customAlias</strong> and <strong>expiryDate</strong> are optional.
              </p>
            </div>

            <button onClick={downloadSampleCSV} className="btn-ghost text-xs flex items-center gap-1.5 mx-auto">
              <Download size={13} />
              Download Sample CSV
            </button>

            {error && (
              <div className="p-3 rounded-lg bg-red-55 border border-red-200">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <AlertTriangle size={14} /> {error}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step: Preview */}
        {step === 'preview' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <p className="text-sm text-surface-600">
                <Eye size={14} className="inline mr-1.5" />
                Preview: <strong className="text-surface-900">{parsedRows.length}</strong> URLs from <span className="text-blue-600">{fileName}</span>
              </p>
            </div>

            {/* Table */}
            <div className="overflow-auto flex-1 rounded-lg border border-surface-200 mb-4">
              <table className="w-full text-xs">
                <thead className="bg-surface-50 sticky top-0 border-b border-surface-200">
                  <tr>
                    <th className="text-left p-2.5 text-surface-500 font-medium w-8">#</th>
                    <th className="text-left p-2.5 text-surface-500 font-medium">URL</th>
                    <th className="text-left p-2.5 text-surface-500 font-medium w-28">Alias</th>
                    <th className="text-left p-2.5 text-surface-500 font-medium w-24">Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row, i) => (
                    <tr key={i} className="border-t border-surface-200 hover:bg-surface-50">
                      <td className="p-2.5 text-surface-400">{i + 1}</td>
                      <td className="p-2.5 text-surface-700 font-mono truncate max-w-[300px]">{row.url}</td>
                      <td className="p-2.5 text-blue-600 font-mono">{row.customAlias || '—'}</td>
                      <td className="p-2.5 text-surface-500">{row.expiryDate || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 mb-4 flex-shrink-0">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-3 flex-shrink-0">
              <button onClick={handleUpload} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Upload size={16} />
                Upload {parsedRows.length} URLs
              </button>
              <button onClick={resetState} className="btn-secondary">
                Change File
              </button>
            </div>
          </div>
        )}

        {/* Step: Uploading */}
        {step === 'uploading' && (
          <div className="py-12 text-center">
            <Loader2 size={36} className="text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-surface-700 font-medium">Shortening {parsedRows.length} URLs...</p>
            <p className="text-xs text-surface-500 mt-1">This may take a moment</p>
          </div>
        )}

        {/* Step: Results */}
        {step === 'results' && results && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-3 mb-4 flex-shrink-0">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-250 text-center">
                <CheckCircle2 size={20} className="text-emerald-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-emerald-900">{results.successCount}</p>
                <p className="text-xs text-emerald-700">Succeeded</p>
              </div>
              <div className="p-4 rounded-xl bg-red-50 border border-red-250 text-center">
                <XCircle size={20} className="text-red-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-red-900">{results.failedCount}</p>
                <p className="text-xs text-red-700">Failed</p>
              </div>
            </div>

            {/* Failed list */}
            {results.failedList?.length > 0 && (
              <div className="mb-4 flex-shrink-0">
                <p className="text-xs font-semibold text-red-600 mb-2 flex items-center gap-1.5">
                  <AlertTriangle size={12} />
                  Failed URLs:
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1.5">
                  {results.failedList.map((f, i) => (
                    <div key={i} className="p-2 rounded-lg bg-red-50/50 border border-red-100 text-xs">
                      <span className="text-surface-500 font-medium">Row {f.row}:</span>{' '}
                      <span className="text-surface-700 font-mono">{f.url}</span>
                      <span className="text-red-600 block mt-0.5">{f.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success list */}
            {results.successList?.length > 0 && (
              <div className="flex-1 overflow-auto mb-4">
                <p className="text-xs font-semibold text-emerald-600 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={12} />
                  Created URLs:
                </p>
                <div className="space-y-1.5">
                  {results.successList.map((s, i) => (
                    <div key={i} className="p-2 rounded-lg bg-emerald-50/50 border border-emerald-100 text-xs flex items-center justify-between">
                      <span className="text-blue-600 font-mono font-medium">{s.shortUrl}</span>
                      <span className="text-surface-600 truncate max-w-[200px] ml-2">{s.url}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handleClose} className="btn-primary w-full flex-shrink-0">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUploadModal;
