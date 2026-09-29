'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useDocumentationStore } from '../../lib/store/useDocumentationStore';
import { DocumentationSection, Endpoint, HttpMethod, Parameter } from '@/lib/types/documentation';
import { AiDescriptionModal } from './AiDescriptionModal';
import {
  Edit3,
  Plus,
  Trash2,
  FileCode,
  Sparkles,
  Layers,
  Code2,
  Info,
} from 'lucide-react';

// Dynamic import of Monaco Editor with SSR disabled
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  { ssr: false }
);

export const SectionEditor: React.FC = () => {
  const {
    project,
    selectedSectionId,
    updateSection,
    updateEndpoint,
    updateMetadata,
  } = useDocumentationStore();

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!project || !selectedSectionId) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center text-slate-400 bg-white">
        <p className="text-xs">Select a section or endpoint from the outline to edit its properties.</p>
      </div>
    );
  }

  // Find section recursively
  let targetSection: DocumentationSection | null = null;
  function findSec(secs: DocumentationSection[]): void {
    for (const s of secs) {
      if (s.id === selectedSectionId) {
        targetSection = s;
        return;
      }
      if (s.children) findSec(s.children);
    }
  }
  findSec(project.sections);

  if (!targetSection) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center text-slate-400 bg-white">
        <p className="text-xs">Section not found.</p>
      </div>
    );
  }

  const sec = targetSection as DocumentationSection;
  const ep = sec.endpoint;

  // Render Cover Editor
  if (sec.type === 'cover') {
    return (
      <div className="p-6 overflow-y-auto h-full space-y-6 bg-white">
        <div className="pb-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Cover Page & Branding Settings</h2>
          <p className="text-xs text-slate-500">Configure title, version, company name and publisher info.</p>
        </div>

        <div className="space-y-4 max-w-xl text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Documentation Title</label>
            <input
              type="text"
              value={project.metadata.title}
              onChange={(e) => updateMetadata({ title: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#FF6C37]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subtitle / Tagline</label>
            <input
              type="text"
              value={project.metadata.subtitle || ''}
              onChange={(e) => updateMetadata({ subtitle: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#FF6C37]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Version</label>
              <input
                type="text"
                value={project.metadata.version}
                onChange={(e) => updateMetadata({ version: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#FF6C37]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Published Date</label>
              <input
                type="text"
                value={project.metadata.date || ''}
                onChange={(e) => updateMetadata({ date: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#FF6C37]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company / Organization</label>
              <input
                type="text"
                value={project.metadata.companyName || ''}
                onChange={(e) => updateMetadata({ companyName: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#FF6C37]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Developer Portal URL</label>
              <input
                type="text"
                value={project.metadata.website || ''}
                onChange={(e) => updateMetadata({ website: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#FF6C37]"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Endpoint Editor
  if (sec.type === 'endpoint' && ep) {
    const handleEditorBeforeMount = (monaco: any) => {
      monaco.editor.defineTheme('postman-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'string.key.json', foreground: '9CDCFE', fontStyle: 'bold' },
          { token: 'string.value.json', foreground: 'CE9178' },
          { token: 'number', foreground: 'B5CEA8' },
          { token: 'keyword.json', foreground: '569CD6', fontStyle: 'bold' },
        ],
        colors: {
          'editor.background': '#1E1E1E',
          'editor.foreground': '#D4D4D4',
          'editorLineNumber.foreground': '#6E7681',
          'editorLineNumber.activeForeground': '#C6C6C6',
        },
      });
    };

    return (
      <div className="p-6 overflow-y-auto h-full space-y-6 bg-white">
        <div className="pb-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF6C37] mb-1">
              <Edit3 className="w-3.5 h-3.5" />
              <span>Endpoint Editor</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{ep.name}</h2>
          </div>

          <button
            type="button"
            onClick={() => setAiModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#FF6C37] to-[#e05624] text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ AI Generate Description</span>
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Endpoint Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Endpoint Title</label>
            <input
              type="text"
              value={ep.name}
              onChange={(e) => updateEndpoint(sec.id, { name: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#FF6C37]"
            />
          </div>

          {/* Method & Route with Postman colors */}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Method</label>
              <select
                value={ep.method}
                onChange={(e) => updateEndpoint(sec.id, { method: e.target.value as HttpMethod })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-[#FF6C37]"
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
                }}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div className="col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">Route Path</label>
              <input
                type="text"
                value={ep.path}
                onChange={(e) => updateEndpoint(sec.id, { path: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#FF6C37]"
              />
            </div>
          </div>

          {/* Description with AI prompt shortcut */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Description</label>
              <button
                type="button"
                onClick={() => setAiModalOpen(true)}
                className="text-[11px] font-semibold text-[#FF6C37] hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Generate with AI prompt</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={ep.description || ''}
              onChange={(e) => updateEndpoint(sec.id, { description: e.target.value })}
              placeholder="Explain the purpose, behavior, and business logic of this endpoint..."
              className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#FF6C37]"
            />
          </div>

          {/* Path Parameters Editor */}
          <ParameterListEditor
            title="Path Parameters"
            parameters={ep.pathParameters}
            onChange={(params) => updateEndpoint(sec.id, { pathParameters: params })}
          />

          {/* Query Parameters Editor */}
          <ParameterListEditor
            title="Query Parameters"
            parameters={ep.queryParameters}
            onChange={(params) => updateEndpoint(sec.id, { queryParameters: params })}
          />

          {/* Headers Editor */}
          <ParameterListEditor
            title="Request Headers"
            parameters={ep.headers}
            onChange={(params) => updateEndpoint(sec.id, { headers: params })}
          />

          {/* Request Body Payload with MONACO EDITOR */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-[#FF6C37]" />
                <span>Request Body (Monaco JSON Editor)</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">Consolas • Postman Dark</span>
            </div>

            <div className="rounded-xl overflow-hidden border border-[#2b2b2b] shadow-xs">
              {mounted ? (
                <MonacoEditor
                  height="200px"
                  language="json"
                  value={ep.requestBody?.rawContent || '{\n  \n}'}
                  theme="postman-dark"
                  beforeMount={handleEditorBeforeMount}
                  onChange={(val) =>
                    updateEndpoint(sec.id, {
                      requestBody: {
                        mode: 'raw',
                        rawType: 'json',
                        rawContent: val || '',
                      },
                    })
                  }
                  options={{
                    fontSize: 12.5,
                    lineHeight: 19,
                    fontFamily: 'Consolas, "Lucida Console", "Courier New", monospace',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    lineNumbersMinChars: 3,
                    wordWrap: 'on',
                    automaticLayout: true,
                    tabSize: 2,
                    padding: { top: 6, bottom: 6 },
                  }}
                />
              ) : (
                <textarea
                  rows={6}
                  value={ep.requestBody?.rawContent || ''}
                  onChange={(e) =>
                    updateEndpoint(sec.id, {
                      requestBody: {
                        mode: 'raw',
                        rawType: 'json',
                        rawContent: e.target.value,
                      },
                    })
                  }
                  className="w-full p-3 font-mono text-xs bg-[#1E1E1E] text-slate-100"
                  style={{ fontFamily: 'Consolas, "Lucida Console", monospace' }}
                />
              )}
            </div>
          </div>
        </div>

        {/* AI Description Modal */}
        <AiDescriptionModal
          isOpen={aiModalOpen}
          onClose={() => setAiModalOpen(false)}
          onApply={(desc) => updateEndpoint(sec.id, { description: desc })}
          sectionTitle={ep.name}
          sectionType="endpoint"
          endpoint={ep}
          currentDescription={ep.description || ''}
        />
      </div>
    );
  }

  // Generic Section Editor (Overview, Getting Started, Custom)
  return (
    <div className="p-6 overflow-y-auto h-full space-y-6 bg-white">
      <div className="pb-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{sec.title}</h2>
          <p className="text-xs text-slate-500">Edit general content, instructions and overview notes.</p>
        </div>

        <button
          type="button"
          onClick={() => setAiModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#FF6C37] to-[#e05624] text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>✨ AI Generate Description</span>
        </button>
      </div>

      <div className="space-y-4 max-w-xl text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Section Title</label>
          <input
            type="text"
            value={sec.title}
            onChange={(e) => updateSection(sec.id, { title: e.target.value })}
            className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#FF6C37]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-slate-700">Description / Documentation Content</label>
            <button
              type="button"
              onClick={() => setAiModalOpen(true)}
              className="text-[11px] font-semibold text-[#FF6C37] hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Prompt AI to write this</span>
            </button>
          </div>
          <textarea
            rows={8}
            value={sec.description || ''}
            onChange={(e) => updateSection(sec.id, { description: e.target.value })}
            placeholder="Provide a comprehensive introduction, developer onboarding guide, or API documentation overview..."
            className="w-full p-3 border border-slate-300 rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-[#FF6C37]"
          />
        </div>

        {sec.type === 'custom' && (
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Custom Notes / Content</label>
            <textarea
              rows={8}
              value={sec.customContent || ''}
              onChange={(e) => updateSection(sec.id, { customContent: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#FF6C37]"
            />
          </div>
        )}
      </div>

      {/* AI Description Modal */}
      <AiDescriptionModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onApply={(desc) => updateSection(sec.id, { description: desc })}
        sectionTitle={sec.title}
        sectionType={sec.type as any}
        currentDescription={sec.description || ''}
      />
    </div>
  );
};

const ParameterListEditor: React.FC<{
  title: string;
  parameters: Parameter[];
  onChange: (parameters: Parameter[]) => void;
}> = ({ title, parameters, onChange }) => {
  const handleAdd = () => {
    onChange([
      ...parameters,
      {
        name: 'param_name',
        type: 'string',
        required: false,
        description: '',
      },
    ]);
  };

  const handleUpdate = (index: number, updates: Partial<Parameter>) => {
    const next = [...parameters];
    next[index] = { ...next[index], ...updates };
    onChange(next);
  };

  const handleDelete = (index: number) => {
    onChange(parameters.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2 pt-2 border-t border-slate-200">
      <div className="flex items-center justify-between">
        <label className="font-semibold text-slate-700">{title}</label>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1 text-[11px] font-semibold text-[#FF6C37] hover:text-[#e05624]"
        >
          <Plus className="w-3 h-3" />
          <span>Add</span>
        </button>
      </div>

      {parameters.length === 0 ? (
        <p className="text-[11px] text-slate-400 italic">No parameters defined.</p>
      ) : (
        <div className="space-y-2">
          {parameters.map((p, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={p.name}
                  onChange={(e) => handleUpdate(idx, { name: e.target.value })}
                  placeholder="name"
                  className="p-1 font-mono font-semibold bg-white border border-slate-300 rounded text-xs flex-1"
                />
                <select
                  value={p.type || 'string'}
                  onChange={(e) => handleUpdate(idx, { type: e.target.value })}
                  className="p-1 bg-white border border-slate-300 rounded text-xs"
                >
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                  <option value="object">object</option>
                  <option value="array">array</option>
                </select>
                <label className="flex items-center gap-1 text-[11px] text-slate-600">
                  <input
                    type="checkbox"
                    checked={p.required || false}
                    onChange={(e) => handleUpdate(idx, { required: e.target.checked })}
                    className="rounded"
                  />
                  <span>Required</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <input
                type="text"
                value={p.description || ''}
                onChange={(e) => handleUpdate(idx, { description: e.target.value })}
                placeholder="Description..."
                className="w-full p-1 bg-white border border-slate-300 rounded text-xs"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
