'use client';

import React, { useMemo } from 'react';
import { DocumentationProject } from '@/lib/types/documentation';
import { ListOrdered } from 'lucide-react';

interface TableOfContentsProps {
  project: DocumentationProject;
  onNavigate?: (id: string) => void;
  pageMap?: Record<string, number>;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  project,
  onNavigate,
  pageMap: externalPageMap,
}) => {
  // Compute calculated page numbers for each section and endpoint
  const pageMap = useMemo(() => {
    if (externalPageMap) return externalPageMap;

    const map: Record<string, number> = {};
    const hasCover = project.sections.some((s) => s.type === 'cover' && !s.hidden);
    const hasToc = project.sections.some((s) => s.type === 'toc' && !s.hidden);

    let curPage = 1;
    if (hasCover) curPage++; // Cover is Page 1
    if (hasToc) curPage++; // TOC is Page 2

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

    return map;
  }, [project, externalPageMap]);

  const handleScrollTo = (targetId: string, e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate?.(targetId);

    const el =
      document.getElementById(`doc-sec-${targetId}`) ||
      document.getElementById(`ep-${targetId}`) ||
      document.getElementById(`doc-group-${targetId}`);

    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.add('ring-2', 'ring-[#FF6C37]');
      setTimeout(() => el.classList.remove('ring-2', 'ring-[#FF6C37]'), 1500);
    }
  };

  let sectionCounter = 1;

  return (
    <div className="h-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-5 mb-8 border-b-2 border-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF6C37] flex items-center justify-center text-white shadow-xs">
              <ListOrdered className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                Table of Contents
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {project.metadata.title} &bull; v{project.metadata.version}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">
            Page Index
          </span>
        </div>

        {/* Contents List */}
        <nav className="space-y-4">
          {project.sections.map((sec) => {
            if (sec.type === 'cover' || sec.type === 'toc' || sec.hidden) return null;
            const currentIndex = sectionCounter++;
            const secPage = pageMap[sec.id] || currentIndex + 2;

            return (
              <div key={sec.id} className="space-y-2">
                {/* Main Section Entry */}
                <div className="flex items-baseline justify-between group">
                  <a
                    href={`#doc-sec-${sec.id}`}
                    onClick={(e) => handleScrollTo(sec.id, e)}
                    className="text-left font-bold text-sm text-slate-900 hover:text-[#FF6C37] transition-colors flex items-center gap-2 group-hover:translate-x-0.5 duration-150"
                  >
                    <span className="font-mono text-xs text-slate-400 w-5">{currentIndex}.</span>
                    <span>{sec.title}</span>
                  </a>

                  {/* Dotted Leader */}
                  <div className="flex-1 mx-3 border-b-2 border-dotted border-slate-300 mb-1" />

                  {/* Page Number */}
                  <a
                    href={`#doc-sec-${sec.id}`}
                    onClick={(e) => handleScrollTo(sec.id, e)}
                    className="font-mono text-xs font-bold text-slate-900 px-2 py-0.5 rounded hover:bg-[#FF6C37]/10 hover:text-[#FF6C37] transition-colors"
                  >
                    {secPage}
                  </a>
                </div>

                {/* Sub-items (Endpoints under group) */}
                {sec.children && sec.children.length > 0 && (
                  <div className="pl-6 space-y-2 border-l-2 border-slate-100 ml-2.5 my-1">
                    {sec.children.map((child, subIdx) => {
                      if (child.hidden) return null;
                      const ep = child.endpoint;
                      const childPage = pageMap[child.id] || secPage;

                      return (
                        <div key={child.id} className="flex items-baseline justify-between group">
                          <a
                            href={`#ep-${child.id}`}
                            onClick={(e) => handleScrollTo(child.id, e)}
                            className="text-left text-xs text-slate-700 hover:text-[#FF6C37] transition-colors flex items-center gap-2 group-hover:translate-x-0.5 duration-150"
                          >
                            <span className="font-mono text-[11px] text-slate-400 w-6">
                              {currentIndex}.{subIdx + 1}
                            </span>
                            <span className="font-medium text-slate-800">{child.title}</span>

                            {/* Method Badge with authentic Postman color */}
                            {ep && (
                              <span
                                style={{
                                  color:
                                    ep.method === 'GET'
                                      ? '#0CBB52'
                                      : ep.method === 'POST'
                                      ? '#FF6C37'
                                      : ep.method === 'PUT'
                                      ? '#097BED'
                                      : ep.method === 'PATCH'
                                      ? '#A660D7'
                                      : '#EB2013',
                                  backgroundColor:
                                    ep.method === 'GET'
                                      ? '#0CBB5215'
                                      : ep.method === 'POST'
                                      ? '#FF6C3715'
                                      : ep.method === 'PUT'
                                      ? '#097BED15'
                                      : ep.method === 'PATCH'
                                      ? '#A660D715'
                                      : '#EB201315',
                                  borderColor:
                                    ep.method === 'GET'
                                      ? '#0CBB5240'
                                      : ep.method === 'POST'
                                      ? '#FF6C3740'
                                      : ep.method === 'PUT'
                                      ? '#097BED40'
                                      : ep.method === 'PATCH'
                                      ? '#A660D740'
                                      : '#EB201340',
                                }}
                                className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase border"
                              >
                                {ep.method}
                              </span>
                            )}
                          </a>

                          {/* Sub Dotted Leader */}
                          <div className="flex-1 mx-3 border-b border-dotted border-slate-200 mb-1" />

                          {/* Sub Page Number */}
                          <a
                            href={`#ep-${child.id}`}
                            onClick={(e) => handleScrollTo(child.id, e)}
                            className="font-mono text-xs font-semibold text-slate-600 px-1.5 py-0.5 rounded hover:bg-[#FF6C37]/10 hover:text-[#FF6C37] transition-colors"
                          >
                            {childPage}
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Running Footer for Table of Contents Page */}
      <div className="pt-6 mt-12 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>{project.metadata.companyName || 'API Reference Specification'}</span>
        <span>Page 2</span>
      </div>
    </div>
  );
};
