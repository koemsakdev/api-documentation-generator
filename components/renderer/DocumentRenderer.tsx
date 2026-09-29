'use client';

import React, { useMemo } from 'react';
import { DocumentationProject, DocumentationSection } from '@/lib/types/documentation';
import { CoverPage } from './CoverPage';
import { TableOfContents } from './TableOfContents';
import { OverviewSection } from './OverviewSection';
import { EndpointDoc } from './EndpointDoc';
import { Folder } from 'lucide-react';

interface DocumentRendererProps {
  project: DocumentationProject;
  onNavigateSection?: (sectionId: string) => void;
  isPrintMode?: boolean;
}

interface A4PageSheetProps {
  children: React.ReactNode;
  pageNumber?: number;
  totalPages?: number;
  sectionTitle?: string;
  documentTitle?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
  id?: string;
  className?: string;
}

const A4PageSheet: React.FC<A4PageSheetProps> = ({
  children,
  pageNumber,
  totalPages,
  sectionTitle,
  documentTitle,
  hideHeader = false,
  hideFooter = false,
  id,
  className = '',
}) => {
  return (
    <div
      id={id}
      className={`a4-page-sheet relative bg-white border border-slate-200/90 shadow-xl rounded-sm mx-auto mb-10 transition-all flex flex-col justify-between page-break-after ${className}`}
      style={{
        width: '794px',
        minHeight: '1123px',
        maxWidth: '100%',
        padding: '44px 48px',
      }}
    >
      {/* Running Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between pb-3 mb-6 border-b border-slate-200 text-[10.5px] font-mono uppercase tracking-wider text-slate-400 select-none">
          <div className="flex items-center gap-2 truncate max-w-sm">
            <span className="font-bold text-slate-800">{documentTitle}</span>
          </div>
          {sectionTitle && (
            <span className="font-bold text-[#FF6C37] truncate max-w-xs">
              {sectionTitle}
            </span>
          )}
        </div>
      )}

      {/* Sheet Content Body */}
      <div className="flex-1 flex flex-col justify-start">
        {children}
      </div>

      {/* Running Footer */}
      {!hideFooter && (
        <div className="flex items-center justify-between pt-4 mt-8 border-t border-slate-200 text-[10.5px] font-mono text-slate-400 select-none">
          <span>Official Developer API Reference</span>
          {pageNumber && (
            <span className="font-bold text-slate-700">
              Page {pageNumber} {totalPages ? `of ${totalPages}` : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export const DocumentRenderer: React.FC<DocumentRendererProps> = ({
  project,
  onNavigateSection,
  isPrintMode = false,
}) => {
  const { theme, metadata } = project;

  // Custom styling based on theme
  const containerStyle: React.CSSProperties = {
    fontFamily:
      theme.fontFamily === 'Google Sans'
        ? '"Google Sans", "Product Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        : theme.fontFamily === 'Inter'
        ? 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        : theme.fontFamily === 'Roboto Mono'
        ? 'Consolas, "Roboto Mono", monospace'
        : theme.fontFamily === 'Outfit'
        ? '"Outfit", sans-serif'
        : theme.fontFamily === 'Roboto'
        ? 'Roboto, sans-serif'
        : 'Merriweather, Georgia, serif',
  };

  // Compute calculated page numbers for each section and endpoint
  const { pageMap, totalPages } = useMemo(() => {
    const map: Record<string, number> = {};
    const hasCover = project.sections.some((s) => s.type === 'cover' && !s.hidden);
    const hasToc = project.sections.some((s) => s.type === 'toc' && !s.hidden);

    let curPage = 1;
    if (hasCover) {
      map['cover'] = 1;
      curPage++;
    }
    if (hasToc) {
      map['toc'] = curPage;
      curPage++;
    }

    project.sections.forEach((sec) => {
      if (sec.type === 'cover' || sec.type === 'toc' || sec.hidden) return;
      map[sec.id] = curPage;

      if (sec.children && sec.children.length > 0) {
        sec.children.forEach((child, cIdx) => {
          map[child.id] = curPage + Math.floor(cIdx / 2);
        });
        curPage += Math.max(1, Math.ceil(sec.children.length / 2));
      } else {
        curPage++;
      }
    });

    return { pageMap: map, totalPages: curPage - 1 };
  }, [project]);

  return (
    <div
      className={`api-document-container mx-auto transition-all ${
        isPrintMode ? 'p-0' : 'py-6 px-2'
      }`}
      style={containerStyle}
    >
      {/* 1. Cover Page Sheet (A4) */}
      {project.sections.some((s: DocumentationSection) => s.type === 'cover' && !s.hidden) && (
        <A4PageSheet
          id="doc-cover"
          hideHeader={true}
          hideFooter={true}
          className="p-0 border-none shadow-xl"
        >
          <CoverPage metadata={metadata} theme={theme} />
        </A4PageSheet>
      )}

      {/* 2. Table of Contents Sheet (A4) */}
      {project.sections.some((s: DocumentationSection) => s.type === 'toc' && !s.hidden) && (
        <A4PageSheet
          id="doc-toc"
          pageNumber={pageMap['toc'] || 2}
          totalPages={totalPages}
          documentTitle={metadata.title}
          sectionTitle="Table of Contents"
        >
          <TableOfContents
            project={project}
            onNavigate={onNavigateSection}
            pageMap={pageMap}
          />
        </A4PageSheet>
      )}

      {/* 3. Content Sections (A4 Pages) */}
      {project.sections.map((section: DocumentationSection) => {
        if (section.type === 'cover' || section.type === 'toc' || section.hidden) {
          return null;
        }

        const secPage = pageMap[section.id] || 3;

        // Overview / Getting Started Section
        if (section.type === 'overview') {
          return (
            <A4PageSheet
              key={section.id}
              id={`doc-sec-${section.id}`}
              pageNumber={secPage}
              totalPages={totalPages}
              documentTitle={metadata.title}
              sectionTitle={section.title}
            >
              <OverviewSection section={section} project={project} />
            </A4PageSheet>
          );
        }

        // API Resource Group
        if (section.type === 'group') {
          return (
            <A4PageSheet
              key={section.id}
              id={`doc-group-${section.id}`}
              pageNumber={secPage}
              totalPages={totalPages}
              documentTitle={metadata.title}
              sectionTitle={section.title}
            >
              <div className="space-y-8">
                {/* Group Heading Banner */}
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    <Folder className="w-4 h-4 text-[#FF6C37]" />
                    <span>API Resource Group</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    {section.title}
                  </h2>
                  {section.description && (
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                      {section.description}
                    </p>
                  )}
                </div>

                {/* Group Endpoints */}
                {section.children &&
                  section.children.map((child: DocumentationSection) => {
                    if (child.hidden) return null;
                    if (child.endpoint) {
                      return <EndpointDoc key={child.id} endpoint={child.endpoint} />;
                    }
                    return null;
                  })}
              </div>
            </A4PageSheet>
          );
        }

        // Standalone Endpoint Section
        if (section.type === 'endpoint' && section.endpoint) {
          return (
            <A4PageSheet
              key={section.id}
              id={`doc-sec-${section.id}`}
              pageNumber={secPage}
              totalPages={totalPages}
              documentTitle={metadata.title}
              sectionTitle={section.endpoint.name}
            >
              <EndpointDoc endpoint={section.endpoint} />
            </A4PageSheet>
          );
        }

        // Custom Notes / Markdown Section
        return (
          <A4PageSheet
            key={section.id}
            id={`doc-sec-${section.id}`}
            pageNumber={secPage}
            totalPages={totalPages}
            documentTitle={metadata.title}
            sectionTitle={section.title}
          >
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                {section.title}
              </h2>
              {section.description && (
                <p className="text-sm text-slate-600 leading-relaxed">
                  {section.description}
                </p>
              )}
              {section.customContent && (
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {section.customContent}
                </div>
              )}
            </div>
          </A4PageSheet>
        );
      })}
    </div>
  );
};
