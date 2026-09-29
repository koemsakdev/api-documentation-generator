'use client';

import React from 'react';
import { DocumentationMetadata, DocumentationTheme } from '@/lib/types/documentation';
import { BookOpen, Calendar, ShieldCheck, User } from 'lucide-react';

interface CoverPageProps {
  metadata: DocumentationMetadata;
  theme: DocumentationTheme;
}

export const CoverPage: React.FC<CoverPageProps> = ({ metadata, theme }) => {
  const { coverStyle } = theme;

  if (coverStyle === 'minimal') {
    return (
      <div className="min-h-[580px] flex flex-col justify-between p-12 bg-white rounded-xl border border-slate-200 page-break-after">
        <div>
          {metadata.logoUrl ? (
            <img
              src={metadata.logoUrl}
              alt="Logo"
              className="h-12 max-w-[200px] object-contain mb-10"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white mb-10 shadow-sm"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <BookOpen className="w-6 h-6" />
            </div>
          )}

          <div className="inline-block text-xs font-semibold tracking-wider uppercase px-2.5 py-1 rounded bg-slate-100 text-slate-700 mb-4">
            API Documentation &bull; v{metadata.version}
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
            {metadata.title}
          </h1>

          {metadata.subtitle && (
            <p className="text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
              {metadata.subtitle}
            </p>
          )}
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-wrap gap-8 text-sm text-slate-600">
          {metadata.companyName && (
            <div>
              <span className="block text-xs uppercase text-slate-400 font-semibold mb-0.5">Organization</span>
              <span className="font-medium text-slate-800">{metadata.companyName}</span>
            </div>
          )}
          {metadata.date && (
            <div>
              <span className="block text-xs uppercase text-slate-400 font-semibold mb-0.5">Published</span>
              <span className="font-medium text-slate-800">{metadata.date}</span>
            </div>
          )}
          {metadata.website && (
            <div>
              <span className="block text-xs uppercase text-slate-400 font-semibold mb-0.5">Portal</span>
              <span className="font-medium text-slate-800">{metadata.website}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (coverStyle === 'modern') {
    return (
      <div className="min-h-[580px] flex flex-col justify-between rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm page-break-after">
        {/* Modern Accent Header */}
        <div
          className="p-12 text-white relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
          }}
        >
          <div className="relative z-10">
            {metadata.logoUrl ? (
              <div className="bg-white/95 p-3 rounded-lg inline-block mb-8 shadow-sm">
                <img
                  src={metadata.logoUrl}
                  alt="Logo"
                  className="h-10 max-w-[180px] object-contain"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            )}

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md mb-4 text-white">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official REST API Reference</span>
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white mb-3">
              {metadata.title}
            </h1>

            {metadata.subtitle && (
              <p className="text-white/90 text-lg max-w-2xl font-light">
                {metadata.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Details */}
        <div className="p-8 bg-slate-50 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 text-sm">
          <div className="flex items-center gap-6 text-slate-600">
            <span className="font-medium">Version: <strong className="text-slate-900">{metadata.version}</strong></span>
            {metadata.companyName && (
              <span className="font-medium">Publisher: <strong className="text-slate-900">{metadata.companyName}</strong></span>
            )}
          </div>
          {metadata.date && (
            <div className="text-xs font-medium text-slate-500">
              Generated: {metadata.date}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Corporate Style (Default)
  return (
    <div className="min-h-[580px] flex flex-col justify-between p-12 bg-white rounded-xl border border-slate-200 shadow-sm page-break-after">
      <div>
        {/* Top corporate bar */}
        <div className="flex items-center justify-between pb-8 mb-8 border-b-2 border-slate-900">
          {metadata.logoUrl ? (
            <img
              src={metadata.logoUrl}
              alt="Logo"
              className="h-12 max-w-[220px] object-contain"
            />
          ) : (
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded flex items-center justify-center text-white"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                {metadata.companyName || 'Enterprise API'}
              </span>
            </div>
          )}
          <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-100 text-slate-800 rounded">
            CONFIDENTIAL &bull; SPECIFICATION
          </span>
        </div>

        <div className="mt-8">
          <span className="text-xs font-bold text-slate-400 tracking-widest uppercase block mb-2">
            Technical Specification Document
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            {metadata.title}
          </h1>
          {metadata.subtitle && (
            <p className="text-base text-slate-600 max-w-2xl leading-relaxed mb-6">
              {metadata.subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="block text-slate-400 font-semibold mb-1 uppercase">Doc Version</span>
          <span className="font-mono font-bold text-slate-800 text-sm">{metadata.version}</span>
        </div>
        <div>
          <span className="block text-slate-400 font-semibold mb-1 uppercase">Date</span>
          <span className="font-semibold text-slate-800 text-sm">{metadata.date || 'Current'}</span>
        </div>
        <div>
          <span className="block text-slate-400 font-semibold mb-1 uppercase">Format</span>
          <span className="font-semibold text-slate-800 text-sm">Postman v2.1 Model</span>
        </div>
        <div>
          <span className="block text-slate-400 font-semibold mb-1 uppercase">Environment</span>
          <span className="font-semibold text-slate-800 text-sm">{metadata.baseUrl || 'Production'}</span>
        </div>
      </div>
    </div>
  );
};

