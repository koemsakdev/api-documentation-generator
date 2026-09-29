'use client';

import React, { useState } from 'react';
import { useDocumentationStore } from '../../lib/store/useDocumentationStore';
import { DocumentationSidebar } from './DocumentationSidebar';
import { SectionEditor } from './SectionEditor';
import { DocumentRenderer } from '../renderer/DocumentRenderer';
import { ThemeCustomizerModal } from '../theme/ThemeCustomizerModal';
import { ExportModal } from '../export/ExportModal';
import {
  ArrowLeft,
  Columns,
  Maximize2,
  Minimize2,
  Palette,
  Download,
  RotateCcw,
  Sparkles,
  ZoomIn,
  ZoomOut,
  LayoutTemplate,
  Monitor,
} from 'lucide-react';

export const DocumentationWorkspace: React.FC = () => {
  const {
    project,
    activeView,
    setActiveView,
    workspaceViewMode,
    setWorkspaceViewMode,
    setThemeDrawerOpen,
    setExportDialogOpen,
    resetProject,
    setSelectedSectionId,
  } = useDocumentationStore();

  const [previewZoom, setPreviewZoom] = useState<number>(100);

  if (!project) return null;

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
      {/* Top Application Bar */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-20 flex-shrink-0 shadow-2xs">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveView('overview')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Health & Overview</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-200" />

          <div className="flex items-center gap-2">
            <h1 className="font-bold text-slate-900 text-sm truncate max-w-[200px] sm:max-w-xs">
              {project.metadata.title}
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
              v{project.metadata.version}
            </span>
          </div>
        </div>

        {/* Center: View Switcher (Split, Editor, Preview) */}
        <div className="hidden md:flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium">
          <button
            type="button"
            onClick={() => setWorkspaceViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
              workspaceViewMode === 'split'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>

          <button
            type="button"
            onClick={() => setWorkspaceViewMode('editor')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
              workspaceViewMode === 'editor'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>

          <button
            type="button"
            onClick={() => setWorkspaceViewMode('preview')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
              workspaceViewMode === 'preview'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Live Document</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setThemeDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Palette className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Theme & Branding</span>
          </button>

          <button
            type="button"
            onClick={() => setExportDialogOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={resetProject}
            title="Import another collection"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <DocumentationSidebar />

        {/* Center: Editor Panel */}
        {(workspaceViewMode === 'split' || workspaceViewMode === 'editor') && (
          <div
            className={`h-full border-r border-slate-200 bg-white overflow-hidden ${
              workspaceViewMode === 'split' ? 'w-2/5' : 'flex-1'
            }`}
          >
            <SectionEditor />
          </div>
        )}

        {/* Right: Live Preview Panel */}
        {(workspaceViewMode === 'split' || workspaceViewMode === 'preview') && (
          <div
            className={`h-full bg-slate-200/80 flex flex-col overflow-hidden ${
              workspaceViewMode === 'split' ? 'w-3/5' : 'flex-1'
            }`}
          >
            {/* Live Preview Controls bar */}
            <div className="h-9 bg-slate-100/90 border-b border-slate-200 px-4 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Interactive Document Canvas (A4 / Web)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewZoom((z) => Math.max(50, z - 10))}
                  title="Zoom Out"
                  className="p-1 hover:text-slate-900"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] font-bold text-slate-700">{previewZoom}%</span>
                <button
                  type="button"
                  onClick={() => setPreviewZoom((z) => Math.min(150, z + 10))}
                  title="Zoom In"
                  className="p-1 hover:text-slate-900"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Scrollable Document Container */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
              <div
                style={{
                  transform: `scale(${previewZoom / 100})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease',
                  width: '100%',
                }}
              >
                <DocumentRenderer
                  project={project}
                  onNavigateSection={(id) => setSelectedSectionId(id)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ThemeCustomizerModal />
      <ExportModal />
    </div>
  );
};

