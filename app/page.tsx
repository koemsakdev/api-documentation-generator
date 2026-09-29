'use client';

import React, { useEffect, useState } from 'react';
import { useDocumentationStore } from '../lib/store/useDocumentationStore';
import { UploadSection } from '../components/upload/UploadSection';
import { OverviewQualityScreen } from '../components/analysis/OverviewQualityScreen';
import { DocumentationWorkspace } from '../components/editor/DocumentationWorkspace';

const STORAGE_KEY = 'api_doc_project_state_v2';

export default function HomePage() {
  const { project, setProject, activeView } = useDocumentationStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && !project) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.sections) {
          setProject(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not restore project from localStorage', e);
    }
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-xs font-semibold text-slate-400">
          Loading API Documentation Studio...
        </div>
      </div>
    );
  }

  if (!project || activeView === 'landing') {
    return <UploadSection />;
  }

  if (activeView === 'overview') {
    return <OverviewQualityScreen />;
  }

  return <DocumentationWorkspace />;
}
