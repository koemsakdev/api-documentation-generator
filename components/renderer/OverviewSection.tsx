'use client';

import React from 'react';
import { DocumentationProject, DocumentationSection } from '@/lib/types/documentation';
import { Globe, KeyRound, Server, Sliders } from 'lucide-react';

interface OverviewSectionProps {
  section: DocumentationSection;
  project: DocumentationProject;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({ section, project }) => {
  return (
    <div id={`sec-${section.id}`} className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
          {section.title}
        </h2>
        {section.description && (
          <p className="text-slate-600 leading-relaxed text-sm max-w-3xl">
            {section.description}
          </p>
        )}
      </div>

      {/* Core Specs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <Server className="w-3.5 h-3.5 text-blue-600" />
            <span>Target Environment</span>
          </div>
          <p className="text-sm font-semibold text-slate-900 font-mono truncate">
            {project.metadata.baseUrl || 'https://api.example.com/v1'}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
            <span>Default Authentication</span>
          </div>
          <p className="text-sm font-semibold text-slate-900">
            Bearer Token (JWT) / API Key
          </p>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>Payload Format</span>
          </div>
          <p className="text-sm font-semibold text-slate-900">
            application/json &bull; UTF-8
          </p>
        </div>
      </div>

      {/* Variables Table */}
      {project.variables.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-500" />
            <h3 className="text-base font-semibold text-slate-900">Collection Variables</h3>
          </div>
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-4">Variable Name</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Value</th>
                  <th className="py-2.5 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {project.variables.map((v, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-medium text-blue-700">
                      <code>{`{{${v.key}}}`}</code>
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">{v.type || 'string'}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-900 max-w-[200px] truncate">
                      {v.value}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{v.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

