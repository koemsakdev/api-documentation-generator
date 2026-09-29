'use client';

import React, { useState, useRef } from 'react';
import { useDocumentationStore } from '../../lib/store/useDocumentationStore';
import { validatePostmanCollection } from '../../lib/postman/validator';
import { normalizePostmanCollection } from '../../lib/postman/normalizer';
import {
  Upload,
  FileCode,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  Shield,
  Layers,
  Zap,
} from 'lucide-react';

export const UploadSection: React.FC = () => {
  const { setProject, loadSampleProject } = useDocumentationStore();
  const [isDragging, setIsDragging] = useState(false);
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [pastedJson, setPastedJson] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Analysis Progress
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const analysisSteps = [
    'Reading Postman collection...',
    'Detecting endpoints and routes...',
    'Analyzing headers & request parameters...',
    'Detecting authentication & credentials...',
    'Checking request & response examples...',
    'Building unified documentation model...',
  ];

  const triggerAnalysis = (parsedJson: any) => {
    setIsAnalyzing(true);
    setCurrentStepIdx(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < analysisSteps.length) {
        setCurrentStepIdx(step);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsAnalyzing(false);
          const project = normalizePostmanCollection(parsedJson, { maskSecrets: true });
          setProject(project);
        }, 400);
      }
    }, 280);
  };

  const handleFile = (file: File) => {
    setErrorMsg(null);
    if (!file.name.endsWith('.json')) {
      setErrorMsg('Please upload a valid .json Postman Collection file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const validation = validatePostmanCollection(content);
        if (!validation.valid) {
          setErrorMsg(validation.error || 'Invalid Postman Collection file.');
          return;
        }
        const parsed = JSON.parse(content);
        triggerAnalysis(parsed);
      } catch (err: any) {
        setErrorMsg('Unable to parse JSON file. Please check syntax.');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handlePasteSubmit = () => {
    setErrorMsg(null);
    if (!pastedJson.trim()) return;

    const validation = validatePostmanCollection(pastedJson);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Invalid Postman collection JSON.');
      return;
    }

    try {
      const parsed = JSON.parse(pastedJson);
      setPasteModalOpen(false);
      triggerAnalysis(parsed);
    } catch {
      setErrorMsg('Invalid JSON format.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-tight">DocGenius</h1>
            <p className="text-[11px] text-slate-500">Postman API Documentation Studio</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={loadSampleProject}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors border border-blue-200"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Try Sample Collection</span>
          </button>
        </div>
      </header>

      {/* Main Hero & Upload Area */}
      <main className="max-w-4xl mx-auto px-6 py-12 flex-1 flex flex-col items-center justify-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Supports Postman Collection v2.0 & v2.1</span>
        </div>

        {/* Hero Title */}
        <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight max-w-2xl leading-tight mb-4">
          Turn Postman Collections into Beautiful API Documentation
        </h2>

        {/* Supporting text */}
        <p className="text-slate-600 text-base sm:text-lg max-w-xl mb-10 leading-relaxed">
          Upload your Postman collection and instantly generate structured, professional API
          documentation that you can customize, preview live, and export to PDF, HTML, or Markdown.
        </p>

        {/* Error notification */}
        {errorMsg && (
          <div className="w-full max-w-xl mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3 text-left">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Analyzing Progress State */}
        {isAnalyzing ? (
          <div className="w-full max-w-xl p-8 bg-white rounded-2xl border border-slate-200 shadow-md text-left space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                <h3 className="font-bold text-slate-900 text-lg">Analyzing your API collection...</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Step {currentStepIdx + 1} of {analysisSteps.length}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                style={{
                  width: `${((currentStepIdx + 1) / analysisSteps.length) * 100}%`,
                }}
              />
            </div>

            {/* Steps list */}
            <div className="space-y-2.5 pt-2">
              {analysisSteps.map((step, idx) => {
                const isDone = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 text-xs transition-colors ${
                      isDone
                        ? 'text-emerald-700 font-medium'
                        : isCurrent
                        ? 'text-blue-700 font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </div>
                    )}
                    <span>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Drag & Drop Area */
          <div className="w-full max-w-xl space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all flex flex-col items-center justify-center group ${
                isDragging
                  ? 'border-blue-600 bg-blue-50/70 scale-[1.01]'
                  : 'border-slate-300 bg-white hover:border-blue-500 hover:bg-slate-50/70 shadow-xs'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />

              <div className="w-16 h-16 rounded-2xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center text-blue-600 transition-colors mb-4 shadow-xs">
                <Upload className="w-8 h-8" />
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">
                Upload Postman Collection
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Drag and drop your <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">.json</code> file here, or click to browse
              </p>

              <button
                type="button"
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium text-xs hover:bg-blue-700 shadow-sm transition-all"
              >
                Select Collection File
              </button>
            </div>

            {/* Alternative options */}
            <div className="flex items-center justify-center gap-4 text-xs">
              <span className="text-slate-400">or</span>
              <button
                type="button"
                onClick={() => setPasteModalOpen(true)}
                className="text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-4"
              >
                Paste Collection JSON
              </button>
              <span className="text-slate-300">&bull;</span>
              <button
                type="button"
                onClick={loadSampleProject}
                className="text-slate-600 hover:text-slate-900 font-medium"
              >
                Load Sample Dataset
              </button>
            </div>
          </div>
        )}

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-3xl">
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <Shield className="w-5 h-5 text-indigo-600 mb-2" />
            <h4 className="text-sm font-bold text-slate-900 mb-1">Secret Masking</h4>
            <p className="text-xs text-slate-500">
              Automatically detects and masks JWTs, API keys, and client secrets before export.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <Layers className="w-5 h-5 text-blue-600 mb-2" />
            <h4 className="text-sm font-bold text-slate-900 mb-1">Unified Renderer</h4>
            <p className="text-xs text-slate-500">
              Live preview, A4 PDF print, and standalone HTML share identical styles and typography.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <FileText className="w-5 h-5 text-emerald-600 mb-2" />
            <h4 className="text-sm font-bold text-slate-900 mb-1">Quality Health Report</h4>
            <p className="text-xs text-slate-500">
              Instant feedback on missing parameter descriptions, missing response codes, and examples.
            </p>
          </div>
        </div>
      </main>

      {/* Paste JSON Modal */}
      {pasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Paste Postman Collection JSON</h3>
              </div>
              <button
                type="button"
                onClick={() => setPasteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                &times;
              </button>
            </div>

            <textarea
              rows={12}
              value={pastedJson}
              onChange={(e) => setPastedJson(e.target.value)}
              placeholder="Paste raw Postman Collection v2.0 or v2.1 JSON string here..."
              className="w-full p-3 font-mono text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPasteModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePasteSubmit}
                disabled={!pastedJson.trim()}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                Analyze Collection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-500 bg-white">
        DocGenius &bull; Built for modern API teams &bull; Privacy-first client processing
      </footer>
    </div>
  );
};

