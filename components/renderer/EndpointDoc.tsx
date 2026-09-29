'use client';

import React, { useState } from 'react';
import { Endpoint, Parameter } from '@/lib/types/documentation';
import { CodeBlock } from './CodeBlock';
import { KeyRound, ShieldAlert, Terminal, FileCode2 } from 'lucide-react';

interface EndpointDocProps {
  endpoint: Endpoint;
}

export const EndpointDoc: React.FC<EndpointDocProps> = ({ endpoint }) => {
  const [activeReqSnippet, setActiveReqSnippet] = useState<'curl' | 'http'>('curl');
  const [activeResponseIdx, setActiveResponseIdx] = useState<number>(0);

  const getMethodBadgeClass = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'POST':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PUT':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'PATCH':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DELETE':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusCodeBadgeClass = (code: number) => {
    if (code >= 200 && code < 300) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (code >= 300 && code < 400) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (code >= 400 && code < 500) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  const activeResponse = endpoint.responses[activeResponseIdx];

  return (
    <div id={`ep-${endpoint.id}`} className="p-6 md:p-8 bg-white rounded-xl border border-slate-200 shadow-sm space-y-8 page-break-inside-avoid">
      {/* Top Header: Title, Description, Method & Path */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            {endpoint.name}
          </h3>
          {endpoint.authentication && endpoint.authentication.type !== 'none' && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              <span className="capitalize">{endpoint.authentication.type} Token</span>
            </div>
          )}
        </div>

        {endpoint.description && (
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            {endpoint.description}
          </p>
        )}

        {/* Method & Path banner */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm">
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${getMethodBadgeClass(
              endpoint.method
            )}`}
          >
            {endpoint.method}
          </span>
          <span className="font-semibold text-slate-900 truncate">
            {endpoint.path}
          </span>
        </div>
      </div>

      {/* Path Parameters */}
      {endpoint.pathParameters.length > 0 && (
        <ParameterTable title="Path Parameters" parameters={endpoint.pathParameters} />
      )}

      {/* Query Parameters */}
      {endpoint.queryParameters.length > 0 && (
        <ParameterTable title="Query Parameters" parameters={endpoint.queryParameters} />
      )}

      {/* Headers */}
      {endpoint.headers.length > 0 && (
        <ParameterTable title="Headers" parameters={endpoint.headers} />
      )}

      {/* Request Body */}
      {endpoint.requestBody && endpoint.requestBody.mode !== 'none' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Request Body <span className="text-slate-400 font-normal">({endpoint.requestBody.mode})</span>
            </h4>
          </div>

          {endpoint.requestBody.rawContent && (
            <CodeBlock
              code={endpoint.requestBody.rawContent}
              language={endpoint.requestBody.rawType || 'json'}
              title="Request Payload"
            />
          )}

          {endpoint.requestBody.parameters && endpoint.requestBody.parameters.length > 0 && (
            <ParameterTable title="Body Parameters" parameters={endpoint.requestBody.parameters} />
          )}
        </div>
      )}

      {/* Request Snippet: cURL / HTTP */}
      {(endpoint.curlSnippet || endpoint.httpSnippet) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Request Example
            </h4>
            <div className="no-print flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium">
              {endpoint.curlSnippet && (
                <button
                  type="button"
                  onClick={() => setActiveReqSnippet('curl')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    activeReqSnippet === 'curl'
                      ? 'bg-white text-slate-900 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  cURL
                </button>
              )}
              {endpoint.httpSnippet && (
                <button
                  type="button"
                  onClick={() => setActiveReqSnippet('http')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    activeReqSnippet === 'http'
                      ? 'bg-white text-slate-900 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Raw HTTP
                </button>
              )}
            </div>
          </div>

          {activeReqSnippet === 'curl' && endpoint.curlSnippet && (
            <CodeBlock code={endpoint.curlSnippet} language="bash" title="cURL" />
          )}
          {activeReqSnippet === 'http' && endpoint.httpSnippet && (
            <CodeBlock code={endpoint.httpSnippet} language="http" title="HTTP Request" />
          )}
        </div>
      )}

      {/* Responses */}
      {endpoint.responses.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Responses
            </h4>
          </div>

          {/* Response status tabs */}
          {endpoint.responses.length > 1 && (
            <div className="no-print flex flex-wrap gap-2">
              {endpoint.responses.map((res, i) => (
                <button
                  key={res.id || i}
                  type="button"
                  onClick={() => setActiveResponseIdx(i)}
                  className={`px-3 py-1.5 rounded-md border text-xs font-mono font-medium transition-all ${
                    activeResponseIdx === i
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold mr-1.5">{res.statusCode}</span>
                  <span>{res.statusText || res.name}</span>
                </button>
              ))}
            </div>
          )}

          {activeResponse && (
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
              <div className="p-3 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${getStatusCodeBadgeClass(
                      activeResponse.statusCode
                    )}`}
                  >
                    {activeResponse.statusCode} {activeResponse.statusText}
                  </span>
                  <span className="text-xs font-medium text-slate-700">
                    {activeResponse.name}
                  </span>
                </div>
              </div>

              {activeResponse.description && (
                <p className="p-3 text-xs text-slate-600 bg-white border-b border-slate-200">
                  {activeResponse.description}
                </p>
              )}

              {activeResponse.body && (
                <CodeBlock
                  code={activeResponse.body}
                  language={activeResponse.bodyType || 'json'}
                  title={`Response Body (${activeResponse.bodyType || 'json'})`}
                  className="rounded-t-none border-none"
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ParameterTable: React.FC<{ title: string; parameters: Parameter[] }> = ({
  title,
  parameters,
}) => {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</h4>
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3">Field</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Requirement</th>
              <th className="py-2.5 px-3">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {parameters.map((p, i) => (
              <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-2.5 px-3 font-mono font-medium text-slate-900">
                  {p.name}
                </td>
                <td className="py-2.5 px-3 text-slate-500">{p.type || 'string'}</td>
                <td className="py-2.5 px-3">
                  {p.required ? (
                    <span className="inline-block px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold text-[10px]">
                      Required
                    </span>
                  ) : (
                    <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                      Optional
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  {p.description || <span className="text-slate-400 italic">No description</span>}
                  {p.example !== undefined && p.example !== null && p.example !== '' && (
                    <div className="mt-0.5 font-mono text-[11px] text-slate-500">
                      Example: <code>{String(p.example)}</code>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

