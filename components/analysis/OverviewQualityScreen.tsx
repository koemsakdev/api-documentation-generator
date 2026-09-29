'use client';

import React, { useState } from 'react';
import { useDocumentationStore } from '../../lib/store/useDocumentationStore';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FolderTree,
  Sliders,
  Layers,
  Sparkles,
  Lock,
  Unlock,
  Eye,
  Key,
} from 'lucide-react';

export const OverviewQualityScreen: React.FC = () => {
  const {
    project,
    setActiveView,
    setSelectedSectionId,
    toggleMaskSecrets,
  } = useDocumentationStore();

  const [secretsModalOpen, setSecretsModalOpen] = useState(false);

  if (!project) return null;

  const { qualityReport, metadata, secrets, sections } = project;

  // Calculate method breakdown
  const methodCounts: Record<string, number> = {
    GET: 0,
    POST: 0,
    PUT: 0,
    PATCH: 0,
    DELETE: 0,
  };

  const groupStats: { name: string; count: number; id: string }[] = [];

  function countEndpoints(secList: typeof sections) {
    for (const sec of secList) {
      if (sec.type === 'group') {
        let count = 0;
        if (sec.children) {
          for (const c of sec.children) {
            if (c.endpoint) {
              count++;
              const m = c.endpoint.method.toUpperCase();
              methodCounts[m] = (methodCounts[m] || 0) + 1;
            }
          }
        }
        groupStats.push({ name: sec.title, count, id: sec.id });
      } else if (sec.type === 'endpoint' && sec.endpoint) {
        const m = sec.endpoint.method.toUpperCase();
        methodCounts[m] = (methodCounts[m] || 0) + 1;
      }
    }
  }

  countEndpoints(sections);

  const handleNavigateToFinding = (targetId?: string) => {
    if (targetId) {
      setSelectedSectionId(targetId);
      setActiveView('workspace');
    }
  };

  const areAllMasked = secrets.every((s) => s.isMasked);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Header Card */}
        <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analysis Complete</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {metadata.title}
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              {metadata.description || 'Collection successfully imported and analyzed.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveView('workspace')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all hover:scale-[1.02] flex-shrink-0"
          >
            <span>Open Documentation Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Total Endpoints
            </span>
            <span className="text-3xl font-black text-slate-900">
              {qualityReport.totalEndpoints}
            </span>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              API Groups / Folders
            </span>
            <span className="text-3xl font-black text-slate-900">
              {groupStats.length}
            </span>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Health Score
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-3xl font-black ${
                qualityReport.score >= 80 ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {qualityReport.score}%
              </span>
            </div>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Secrets Detected
            </span>
            <span className="text-3xl font-black text-indigo-600">
              {secrets.length}
            </span>
          </div>
        </div>

        {/* HTTP Methods Breakdown Pills */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            HTTP Methods Distribution
          </h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(methodCounts).map(([method, count]) => {
              if (count === 0) return null;
              return (
                <div
                  key={method}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-mono font-medium"
                >
                  <span
                    className={`font-bold ${
                      method === 'GET'
                        ? 'text-blue-600'
                        : method === 'POST'
                        ? 'text-emerald-600'
                        : method === 'PUT'
                        ? 'text-amber-600'
                        : method === 'DELETE'
                        ? 'text-rose-600'
                        : 'text-purple-600'
                    }`}
                  >
                    {method}
                  </span>
                  <span className="font-bold text-slate-900">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Secret Protection Banner */}
        {secrets.length > 0 && (
          <div className="p-6 bg-amber-50/70 border border-amber-200 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-800">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Potential Sensitive Information Detected ({secrets.length} item{secrets.length > 1 ? 's' : ''})
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Found Bearer JWTs, API keys, or credentials. Values are automatically masked in the preview and exports.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleMaskSecrets}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    areAllMasked
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  {areAllMasked ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Masked (Protected)</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Unmasked (Raw)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSecretsModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Review Secrets
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Documentation Health Report */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Documentation Health Findings</h3>
              <span className="text-xs font-mono text-slate-500">
                Score: {qualityReport.score}%
              </span>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {qualityReport.findings.map((f) => (
                <div
                  key={f.id}
                  onClick={() => handleNavigateToFinding(f.targetId)}
                  className={`p-3 rounded-lg border text-xs flex items-start justify-between gap-3 transition-colors ${
                    f.targetId ? 'cursor-pointer hover:border-blue-400' : ''
                  } ${
                    f.type === 'success'
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50/50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {f.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    )}
                    <span>{f.message}</span>
                  </div>
                  {f.targetId && (
                    <span className="text-[10px] font-bold text-blue-600 uppercase flex-shrink-0 underline">
                      Fix &rarr;
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* API Groups / Folders Overview */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Detected API Groups</h3>
              <span className="text-xs text-slate-500">{groupStats.length} Groups</span>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                    <th className="py-2.5 px-4">Group Name</th>
                    <th className="py-2.5 px-4 text-right">Endpoints</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {groupStats.map((g) => (
                    <tr
                      key={g.id}
                      onClick={() => handleNavigateToFinding(g.id)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-4 font-semibold text-slate-800 flex items-center gap-2">
                        <FolderTree className="w-3.5 h-3.5 text-blue-600" />
                        <span>{g.name}</span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                        {g.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={() => setActiveView('workspace')}
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg transition-all"
          >
            <span>Proceed to Documentation Workspace</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Review Secrets Modal */}
      {secretsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">Detected Sensitive Information</h3>
              </div>
              <button
                type="button"
                onClick={() => setSecretsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-600">
              DocGenius masks sensitive tokens by default so that client secrets, JWTs, and private keys are never exposed in generated documentation.
            </p>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {secrets.map((sec) => (
                <div key={sec.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase text-[11px]">{sec.type.replace('_', ' ')}</span>
                    <span className="text-slate-500 font-mono text-[10px]">{sec.location}</span>
                  </div>
                  <div className="font-mono text-[11px]">
                    <span className="text-slate-400">Masked as: </span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-1 py-0.5 rounded">{sec.maskedValue}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSecretsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

