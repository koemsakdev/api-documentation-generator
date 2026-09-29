'use client';

import React, { useState } from 'react';
import { Sparkles, X, Wand2, Check, RefreshCw, BookOpen, Layers } from 'lucide-react';
import { Endpoint } from '@/lib/types/documentation';

interface AiDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (generatedDescription: string) => void;
  sectionTitle: string;
  sectionType: 'overview' | 'endpoint' | 'custom' | 'cover';
  endpoint?: Endpoint;
  currentDescription?: string;
}

export const AiDescriptionModal: React.FC<AiDescriptionModalProps> = ({
  isOpen,
  onClose,
  onApply,
  sectionTitle,
  sectionType,
  endpoint,
  currentDescription = '',
}) => {
  const [userPrompt, setUserPrompt] = useState('');
  const [tone, setTone] = useState<'developer' | 'concise' | 'enterprise' | 'step-by-step'>('developer');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState(currentDescription);
  const [stepMessage, setStepMessage] = useState('');

  if (!isOpen) return null;

  const quickPrompts = [
    'Explain prerequisites, authorization requirements, and error scenarios.',
    'Write a concise, developer-friendly summary with practical usage tips.',
    'Provide step-by-step onboarding instructions for getting started with this API.',
    'Highlight security best practices, rate limits, and payload validation rules.',
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStepMessage('Analyzing API schema and context...');

    await new Promise((r) => setTimeout(r, 450));
    setStepMessage('Applying requested style and tone...');
    await new Promise((r) => setTimeout(r, 450));

    let result = '';

    if (sectionType === 'endpoint' && endpoint) {
      const method = endpoint.method;
      const path = endpoint.path;
      const paramsCount = (endpoint.pathParameters.length + endpoint.queryParameters.length);
      const hasBody = endpoint.requestBody && endpoint.requestBody.mode !== 'none';

      if (tone === 'concise') {
        result = `Executes a ${method} request against \`${path}\`. ${userPrompt ? `Special consideration: ${userPrompt}. ` : ''}Ensures high-throughput processing and returns standard JSON payloads.`;
      } else if (tone === 'enterprise') {
        result = `The \`${method} ${path}\` endpoint is an enterprise-grade service for managing ${endpoint.name.toLowerCase()}. 

### Key Characteristics
- **Authentication**: Requires valid Bearer or API credentials with appropriate read/write scopes.
- **Idempotency**: Requests must be safely retryable using standard correlation headers.
- **Validation**: Strict schema validation is enforced on all ${paramsCount > 0 ? `${paramsCount} declared parameters` : 'request inputs'}.
${userPrompt ? `\n> **Note**: ${userPrompt}` : ''}`;
      } else if (tone === 'step-by-step') {
        result = `Follow these steps to successfully interact with \`${path}\`:

1. **Authenticate**: Obtain an active bearer token or API key from your developer console.
2. **Prepare Request**: Format your headers with \`Accept: application/json\`${hasBody ? ' and set `Content-Type: application/json` for the body' : ''}.
3. **Execute Call**: Dispatch a ${method} request to your configured host base URL.
4. **Handle Response**: Process standard HTTP 200/201 confirmations, or gracefully handle 4xx client validation errors.
${userPrompt ? `\n*Guidance Note*: ${userPrompt}` : ''}`;
      } else {
        result = `The \`${endpoint.name}\` endpoint (${method} \`${path}\`) enables developers to seamlessly interact with API resources. 

${userPrompt ? `**User Focus**: ${userPrompt}\n\n` : ''}### Overview
This endpoint is designed for maximum developer ergonomics. It validates inbound parameters, handles transactional data integrity, and returns predictable structured JSON representations.

### Common Use Cases
- Retrieving and synchronizing current state within client applications.
- Integrating automated workflows and asynchronous webhook triggers.
- Safe client-side caching when paired with standard ETag and Cache-Control headers.`;
      }
    } else {
      if (sectionTitle.toLowerCase().includes('getting started')) {
        result = `# Getting Started with the API

Welcome to the official developer documentation for **${sectionTitle}**. Follow this quick walkthrough to make your very first authenticated API request in less than 5 minutes.

${userPrompt ? `> **Custom Note**: ${userPrompt}\n\n` : ''}### 1. Prerequisites
- A verified developer account with an active API Key or OAuth Client credentials.
- An HTTP client (such as cURL, Postman, or your programming language's HTTP library).

### 2. Base URL
All production API endpoints are served securely over HTTPS:
\`\`\`
https://api.yourdomain.com/v1
\`\`\`

### 3. Authentication
Include your authorization credential in the HTTP request headers:
\`\`\`http
Authorization: Bearer YOUR_ACCESS_TOKEN
\`\`\`

### 4. Making Your First Request
Test your connection with the health check or ping endpoint. If configured correctly, the server will reply with an \`HTTP 200 OK\` status.`;
      } else {
        result = `Welcome to **${sectionTitle}**. This section provides comprehensive architectural guidelines, security specifications, and reference details for integrating seamlessly with our services.

${userPrompt ? `> **Specification Highlight**: ${userPrompt}\n\n` : ''}### Key Principles
- **RESTful Architecture**: Resources are addressed via standard URL paths and manipulated using intuitive HTTP methods.
- **Predictable Responses**: All responses are formatted in strict RFC 8259 JSON with consistent error envelope models.
- **High Reliability**: Backed by globally distributed infrastructure featuring automated failover and 99.99% uptime SLA.`;
      }
    }

    setGeneratedText(result);
    setIsGenerating(false);
    setStepMessage('');
  };

  const handleApply = () => {
    onApply(generatedText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF6C37] flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                AI Description Generator
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white uppercase font-mono tracking-wider font-semibold">
                  Intelligent Prompt
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Generate high-quality documentation for: <span className="text-[#FF6C37] font-semibold">{sectionTitle}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Custom Prompt Input */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Custom Instructions / Prompt (What would you like the AI to emphasize?)
            </label>
            <textarea
              rows={3}
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="e.g. Highlight that this requires admin authorization, explain rate limits, and provide step-by-step developer tips..."
              className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#FF6C37] focus:border-transparent outline-none transition-all shadow-inner"
            />
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Quick Prompt Suggestions:</span>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((qp, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setUserPrompt(qp)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#FF6C37]/10 hover:text-[#FF6C37] border border-slate-200 text-[11px] text-slate-600 transition-colors text-left"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>

          {/* Tone & Style Selection */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Documentation Tone & Depth
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'developer', label: 'Developer Friendly', desc: 'Clear, modern & helpful' },
                { id: 'concise', label: 'Concise & Direct', desc: 'Brief & essential facts' },
                { id: 'enterprise', label: 'Enterprise & Security', desc: 'Formal, strict compliance' },
                { id: 'step-by-step', label: 'Step-by-Step Guide', desc: 'Walkthrough onboarding' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    tone === t.id
                      ? 'border-[#FF6C37] bg-[#FF6C37]/5 ring-1 ring-[#FF6C37]'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <p className="font-bold text-slate-800 text-xs">{t.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Action Button */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6C37] hover:bg-[#e05624] text-white font-bold text-xs shadow-md shadow-[#FF6C37]/30 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{stepMessage || 'Generating with AI...'}</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Description</span>
                </>
              )}
            </button>
            <span className="text-[11px] text-slate-400">
              Uses schema context & instructions
            </span>
          </div>

          {/* Generated Result Preview */}
          {generatedText && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#0CBB52]" />
                  <span>Generated Result (Editable Preview)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setGeneratedText('')}
                  className="text-[11px] text-slate-400 hover:text-rose-600"
                >
                  Clear
                </button>
              </div>
              <textarea
                rows={8}
                value={generatedText}
                onChange={(e) => setGeneratedText(e.target.value)}
                className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0CBB52] outline-none"
                style={{ fontFamily: 'Consolas, "Lucida Console", "Courier New", monospace' }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!generatedText.trim()}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0CBB52] hover:bg-[#0a9e45] text-white text-xs font-bold shadow-md shadow-[#0CBB52]/20 transition-all disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>Apply to Documentation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
