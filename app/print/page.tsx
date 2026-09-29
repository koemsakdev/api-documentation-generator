'use client';

import React, { useEffect, useState } from 'react';
import { DocumentationProject } from '../../lib/types/documentation';
import { samplePostmanCollection } from '../../lib/sample/sample-collection';
import { normalizePostmanCollection } from '../../lib/postman/normalizer';
import { DocumentRenderer } from '../../components/renderer/DocumentRenderer';
import { Printer, ArrowLeft } from 'lucide-react';

const STORAGE_KEY = 'api_doc_project_state_v1';

export default function PrintPage() {
  const [project, setProject] = useState<DocumentationProject | null>(null);

  useEffect(() => {
    let loaded: DocumentationProject | null = null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        loaded = JSON.parse(stored);
      }
    } catch {
      // fallback
    }

    if (!loaded) {
      loaded = normalizePostmanCollection(samplePostmanCollection, { maskSecrets: true });
    }

    setProject(loaded);

    // Auto-trigger print dialog after render
    const timer = setTimeout(() => {
      window.print();
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  if (!project) return null;

  return (
    <div className="min-h-screen bg-white text-slate-900 p-0">
      {/* Floating print action bar (hidden during print) */}
      <div className="no-print fixed top-4 right-4 z-50 flex items-center gap-2 bg-slate-900 text-white p-2 rounded-xl shadow-xl">
        <button
          type="button"
          onClick={() => window.close()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold shadow"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      <DocumentRenderer project={project} isPrintMode={true} />
    </div>
  );
}

