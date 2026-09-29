'use client';

import React, { useState } from 'react';
import { useDocumentationStore } from '../../lib/store/useDocumentationStore';
import { DocumentationSection } from '@/lib/types/documentation';
import {
  Search,
  BookOpen,
  ListOrdered,
  FileText,
  Folder,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit2,
  Check,
} from 'lucide-react';

export const DocumentationSidebar: React.FC = () => {
  const {
    project,
    selectedSectionId,
    setSelectedSectionId,
    toggleSectionVisibility,
    updateSection,
    reorderSections,
  } = useDocumentationStore();

  const [search, setSearch] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  if (!project) return null;

  const toggleGroupCollapse = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const startRename = (sec: DocumentationSection, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(sec.id);
    setEditingTitle(sec.title);
  };

  const saveRename = (secId: string) => {
    if (editingTitle.trim()) {
      updateSection(secId, { title: editingTitle.trim() });
    }
    setEditingId(null);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= project.sections.length) return;
    const newSecs = [...project.sections];
    const [moved] = newSecs.splice(index, 1);
    newSecs.splice(newIdx, 0, moved);
    reorderSections(newSecs);
  };

  const handleAddCustomSection = () => {
    const newSec: DocumentationSection = {
      id: `custom-${Date.now()}`,
      type: 'custom',
      title: 'New Section',
      description: 'Custom notes, deployment instructions, or error codes.',
      customContent: 'Write markdown or notes here...',
    };
    reorderSections([...project.sections, newSec]);
    setSelectedSectionId(newSec.id);
  };

  const handleDeleteSection = (secId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = project.sections.filter((s) => s.id !== secId);
    reorderSections(filtered);
    if (selectedSectionId === secId) {
      setSelectedSectionId(filtered[0]?.id || null);
    }
  };

  // Filter sections by search
  const filteredSections = project.sections.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    if (s.title.toLowerCase().includes(q)) return true;
    if (s.children?.some((c) => c.title.toLowerCase().includes(q) || c.endpoint?.path.toLowerCase().includes(q))) {
      return true;
    }
    return false;
  });

  return (
    <aside className="w-80 h-full bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 select-none">
      {/* Search Header */}
      <div className="p-3 border-b border-slate-800 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search endpoints, sections..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 border border-slate-700/60"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
          <span className="font-semibold uppercase tracking-wider">Document Outline</span>
          <button
            type="button"
            onClick={handleAddCustomSection}
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Add Section</span>
          </button>
        </div>
      </div>

      {/* Sections Hierarchy List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredSections.map((sec, idx) => {
          const isSelected = selectedSectionId === sec.id;
          const isGroup = sec.type === 'group';
          const isCollapsed = collapsedGroups[sec.id] || false;

          return (
            <div key={sec.id} className="space-y-0.5">
              {/* Section Row */}
              <div
                onClick={() => setSelectedSectionId(sec.id)}
                className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100'
                } ${sec.hidden ? 'opacity-40' : ''}`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {isGroup && (
                    <button
                      type="button"
                      onClick={(e) => toggleGroupCollapse(sec.id, e)}
                      className="p-0.5 hover:bg-slate-700/50 rounded"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                  )}

                  {!isGroup && getSectionIcon(sec.type)}

                  {editingId === sec.id ? (
                    <div className="flex items-center gap-1 flex-1">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveRename(sec.id)}
                        className="bg-slate-800 text-white px-1.5 py-0.5 rounded text-xs w-full focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => saveRename(sec.id)}
                        className="p-0.5 text-emerald-400"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="truncate">{sec.title}</span>
                  )}
                </div>

                {/* Quick Action Buttons on Hover */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMove(idx, 'up');
                    }}
                    title="Move up"
                    className="p-1 hover:text-white"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMove(idx, 'down');
                    }}
                    title="Move down"
                    className="p-1 hover:text-white"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => startRename(sec, e)}
                    title="Rename"
                    className="p-1 hover:text-white"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSectionVisibility(sec.id);
                    }}
                    title={sec.hidden ? 'Show section' : 'Hide section'}
                    className="p-1 hover:text-white"
                  >
                    {sec.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                  {sec.type === 'custom' && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSection(sec.id, e)}
                      title="Delete section"
                      className="p-1 hover:text-rose-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Children (Endpoints under group) */}
              {isGroup && !isCollapsed && sec.children && (
                <div className="pl-5 space-y-0.5 border-l border-slate-800 ml-4 my-0.5">
                  {sec.children.map((child) => {
                    const isChildSelected = selectedSectionId === child.id;
                    const ep = child.endpoint;

                    return (
                      <div
                        key={child.id}
                        onClick={() => setSelectedSectionId(child.id)}
                        className={`group flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer text-xs transition-all ${
                          isChildSelected
                            ? 'bg-blue-600/90 text-white font-semibold'
                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                        } ${child.hidden ? 'opacity-40' : ''}`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          {ep && (
                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                                ep.method === 'GET'
                                  ? 'bg-blue-950 text-blue-400'
                                  : ep.method === 'POST'
                                  ? 'bg-emerald-950 text-emerald-400'
                                  : ep.method === 'PUT'
                                  ? 'bg-amber-950 text-amber-400'
                                  : 'bg-rose-950 text-rose-400'
                              }`}
                            >
                              {ep.method}
                            </span>
                          )}
                          <span className="truncate">{child.title}</span>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSectionVisibility(child.id);
                            }}
                            title={child.hidden ? 'Show' : 'Hide'}
                            className="p-0.5 hover:text-white"
                          >
                            {child.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

function getSectionIcon(type: string) {
  switch (type) {
    case 'cover':
      return <BookOpen className="w-3.5 h-3.5 text-blue-400" />;
    case 'toc':
      return <ListOrdered className="w-3.5 h-3.5 text-indigo-400" />;
    case 'overview':
      return <FileText className="w-3.5 h-3.5 text-emerald-400" />;
    case 'group':
      return <Folder className="w-3.5 h-3.5 text-amber-400" />;
    default:
      return <FileText className="w-3.5 h-3.5 text-slate-400" />;
  }
}

