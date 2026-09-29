'use client';

import React, { useState } from 'react';
import { useDocumentationStore } from '../../lib/store/useDocumentationStore';
import { exportToHtml } from '../../lib/export/html';
import { exportToMarkdown } from '../../lib/export/markdown';
import confetti from 'canvas-confetti';
import {
  Download,
  FileText,
  FileCode,
  Printer,
  CheckCircle2,
  X,
  Loader2,
  Sparkles,
} from 'lucide-react';

export const ExportModal: React.FC = () => {
  const { project, isExportDialogOpen, setExportDialogOpen } = useDocumentationStore();

  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'html' | 'markdown'>('pdf');
  const [includeCover, setIncludeCover] = useState(true);
  const [includeToc, setIncludeToc] = useState(true);
  const [includeCurl, setIncludeCurl] = useState(true);
  const [includeResponses, setIncludeResponses] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!project || !isExportDialogOpen) return null;

  const triggerDownload = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    setIsExporting(true);
    setExportSuccess(false);

    setTimeout(() => {
      if (selectedFormat === 'markdown') {
        const md = exportToMarkdown(project);
        triggerDownload(
          `${project.metadata.title.toLowerCase().replace(/\s+/g, '-')}-docs.md`,
          md,
          'text/markdown;charset=utf-8'
        );
      } else if (selectedFormat === 'html') {
        const html = exportToHtml(project);
        triggerDownload(
          `${project.metadata.title.toLowerCase().replace(/\s+/g, '-')}-docs.html`,
          html,
          'text/html;charset=utf-8'
        );
      } else if (selectedFormat === 'pdf') {
        // Open dedicated print view which triggers print dialogue
        window.open('/print', '_blank');
      }

      setIsExporting(false);
      setExportSuccess(true);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">Export Documentation</h3>
          </div>
          <button
            type="button"
            onClick={() => setExportDialogOpen(false)}
            className="text-slate-400 hover:text-slate-600 text-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Select Export Format
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setSelectedFormat('pdf')}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                selectedFormat === 'pdf'
                  ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold ring-1 ring-blue-600'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Printer className="w-5 h-5" />
              <span className="text-xs">PDF Document</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFormat('html')}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                selectedFormat === 'html'
                  ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold ring-1 ring-blue-600'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FileCode className="w-5 h-5" />
              <span className="text-xs">Standalone HTML</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFormat('markdown')}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                selectedFormat === 'markdown'
                  ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold ring-1 ring-blue-600'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-xs">Markdown</span>
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
          <label className="block font-bold text-slate-700 uppercase tracking-wider">
            Included Components
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCover}
                onChange={(e) => setIncludeCover(e.target.checked)}
                className="rounded"
              />
              <span className="text-slate-800 font-medium">Include Cover Page</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={includeToc}
                onChange={(e) => setIncludeToc(e.target.checked)}
                className="rounded"
              />
              <span className="text-slate-800 font-medium">Table of Contents</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCurl}
                onChange={(e) => setIncludeCurl(e.target.checked)}
                className="rounded"
              />
              <span className="text-slate-800 font-medium">cURL Snippets</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={includeResponses}
                onChange={(e) => setIncludeResponses(e.target.checked)}
                className="rounded"
              />
              <span className="text-slate-800 font-medium">Response Examples</span>
            </label>
          </div>
        </div>

        {/* Success Alert */}
        {exportSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Export generated successfully!</span>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setExportDialogOpen(false)}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Preparing Export...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export {selectedFormat.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

