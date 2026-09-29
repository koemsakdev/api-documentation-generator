'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Check, Copy, Code2, Terminal } from 'lucide-react';

// Dynamic import of Monaco Editor
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => null,
  }
);

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  className?: string;
  maxHeight?: number;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code = '',
  language = 'json',
  title,
  className = '',
  maxHeight = 460,
}) => {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = useMemo(() => (code || '').split('\n'), [code]);
  const lineCount = lines.length;
  const editorHeight = Math.min(Math.max(lineCount * 21 + 24, 76), maxHeight);

  // Map language to Monaco language identifier
  const getMonacoLanguage = (lang: string): string => {
    const l = (lang || '').toLowerCase().trim();
    if (l === 'json') return 'json';
    if (l === 'bash' || l === 'curl' || l === 'shell' || l === 'sh') return 'shell';
    if (l === 'javascript' || l === 'js') return 'javascript';
    if (l === 'typescript' || l === 'ts') return 'typescript';
    if (l === 'html' || l === 'xml') return 'xml';
    if (l === 'yaml' || l === 'yml') return 'yaml';
    return 'plaintext';
  };

  const handleEditorBeforeMount = (monaco: any) => {
    // Exact Postman / VS Code Dark+ theme
    monaco.editor.defineTheme('postman-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'string.key.json', foreground: '9CDCFE', fontStyle: 'bold' }, // Postman JSON Key: Cyan Blue
        { token: 'string.value.json', foreground: 'CE9178' }, // Postman JSON String: Warm Coral
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' }, // Numbers: Sage Green
        { token: 'keyword.json', foreground: '569CD6', fontStyle: 'bold' }, // Booleans/null: Blue
        { token: 'keyword', foreground: '569CD6' },
        { token: 'delimiter', foreground: 'D4D4D4' },
      ],
      colors: {
        'editor.background': '#1E1E1E', // Postman dark console
        'editor.foreground': '#D4D4D4',
        'editorLineNumber.foreground': '#6E7681',
        'editorLineNumber.activeForeground': '#C6C6C6',
        'editor.lineHighlightBackground': '#262626',
        'editorCursor.foreground': '#FF6C37',
        'editorIndentGuide.background': '#3A3A3A',
        'editorIndentGuide.activeBackground': '#555555',
      },
    });
  };

  // Immediate authentic Postman syntax highlighter (exact match to screenshot)
  const highlightedLines = useMemo(() => {
    const l = (language || '').toLowerCase().trim();

    return lines.map((line) => {
      let escaped = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      if (l === 'json') {
        const jsonRegex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}[\],:])/g;

        escaped = escaped.replace(jsonRegex, (match) => {
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              // JSON Key in Postman: #9CDCFE (Cyan)
              const keyPart = match.slice(0, -1);
              return `<span style="color: #9CDCFE; font-weight: 500;">${keyPart}</span><span style="color: #D4D4D4;">:</span>`;
            } else {
              // JSON String Value in Postman: #CE9178 (Warm Coral)
              return `<span style="color: #CE9178;">${match}</span>`;
            }
          } else if (/true|false/.test(match)) {
            // Boolean in Postman: #569CD6 (Blue)
            return `<span style="color: #569CD6; font-weight: bold;">${match}</span>`;
          } else if (/null/.test(match)) {
            return `<span style="color: #569CD6; font-style: italic;">${match}</span>`;
          } else if (/^-?\d+/.test(match)) {
            // Number in Postman: #B5CEA8 (Soft Sage Green)
            return `<span style="color: #B5CEA8;">${match}</span>`;
          } else {
            // Punctuation { } [ ]
            return `<span style="color: #D4D4D4;">${match}</span>`;
          }
        });
      } else if (l === 'curl' || l === 'bash' || l === 'shell') {
        escaped = escaped
          .replace(/\b(curl)\b/g, '<span style="color: #FF6C37; font-weight: bold;">$1</span>')
          .replace(/\b(GET)\b/g, '<span style="color: #0CBB52; font-weight: bold;">$1</span>')
          .replace(/\b(POST)\b/g, '<span style="color: #FF6C37; font-weight: bold;">$1</span>')
          .replace(/\b(PUT)\b/g, '<span style="color: #097BED; font-weight: bold;">$1</span>')
          .replace(/\b(PATCH)\b/g, '<span style="color: #A660D7; font-weight: bold;">$1</span>')
          .replace(/\b(DELETE)\b/g, '<span style="color: #EB2013; font-weight: bold;">$1</span>')
          .replace(/(--?[a-zA-Z0-9_-]+)/g, '<span style="color: #9CDCFE;">$1</span>')
          .replace(/(https?:\/\/[^\s"']+)/g, '<span style="color: #4EC9B0; text-decoration: underline;">$1</span>')
          .replace(/(\{\{[a-zA-Z0-9_-]+\}\})/g, '<span style="color: #FF6C37; font-weight: bold;">$1</span>');
      }

      return escaped || '&nbsp;';
    });
  }, [lines, language]);

  return (
    <div
      className={`rounded-xl overflow-hidden border border-[#2e2e2e] bg-[#1E1E1E] text-slate-100 shadow-lg ${className}`}
      style={{ fontFamily: 'Consolas, "Lucida Console", "Courier New", monospace' }}
    >
      {/* Top Postman window toolbar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#181818] border-b border-[#2b2b2b] text-xs font-mono select-none">
        <div className="flex items-center gap-2">
          {/* Postman Traffic dots */}
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EB2013]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6C37]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#0CBB52]" />
          </div>

          {/* Badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#242424] border border-[#333333] text-[11px] font-semibold tracking-wide">
            {language === 'curl' || language === 'bash' ? (
              <Terminal className="w-3 h-3 text-[#FF6C37]" />
            ) : (
              <Code2 className="w-3 h-3 text-[#0CBB52]" />
            )}
            <span className="text-[#9CDCFE] uppercase font-bold">{title || language}</span>
          </div>

          <span className="text-[11px] text-slate-500 hidden sm:inline">
            {lineCount} {lineCount === 1 ? 'line' : 'lines'}
          </span>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          type="button"
          className="no-print flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#252525] hover:bg-[#333333] border border-[#383838] text-slate-300 hover:text-white transition-all text-[11px] font-medium"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#0CBB52]" />
              <span className="text-[#0CBB52] font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body: Monaco Editor or Instant Highlighted Gutter */}
      {mounted ? (
        <div className="py-2.5 bg-[#1E1E1E]">
          <MonacoEditor
            height={`${editorHeight}px`}
            language={getMonacoLanguage(language)}
            value={code}
            theme="postman-dark"
            beforeMount={handleEditorBeforeMount}
            options={{
              readOnly: true,
              domReadOnly: true,
              fontSize: 13,
              lineHeight: 21,
              fontFamily: 'Consolas, "Lucida Console", "Courier New", monospace',
              fontWeight: '500',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: lineCount > 1 ? 'on' : 'off',
              lineNumbersMinChars: 3,
              folding: true,
              renderLineHighlight: 'all',
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 2,
              padding: { top: 6, bottom: 6 },
              contextmenu: false,
              scrollbar: {
                vertical: 'hidden',
                horizontal: 'auto',
                horizontalScrollbarSize: 8,
              },
            }}
          />
        </div>
      ) : (
        <div
          className="py-3 px-1 overflow-x-auto text-[13px] leading-[21px] bg-[#1E1E1E] select-text flex"
          style={{ maxHeight: `${maxHeight}px`, fontFamily: 'Consolas, "Lucida Console", "Courier New", monospace' }}
        >
          {/* Line Numbers Gutter */}
          {lineCount > 1 && (
            <div className="select-none text-right pr-3.5 pl-2 text-[#6E7681] border-r border-[#333333] bg-[#1A1A1A] font-mono">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          )}

          {/* Indent Guide Line & Code Lines */}
          <div className="pl-4 pr-4 flex-1 font-mono">
            {highlightedLines.map((lineHtml, i) => (
              <div
                key={i}
                dangerouslySetInnerHTML={{ __html: lineHtml }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
