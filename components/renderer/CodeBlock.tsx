'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Check, Copy, Code2, Terminal, Cpu } from 'lucide-react';

// Dynamic import of Monaco Editor for interactive exploration
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="p-4 text-xs font-mono text-slate-500 bg-[#1E1E1E]">
        Loading Monaco Editor...
      </div>
    ),
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
  const [useMonaco, setUseMonaco] = useState(false);

  // Pretty-print JSON if applicable so it's never squashed or unformatted
  const formattedCode = useMemo(() => {
    if (!code) return '';
    const l = (language || '').toLowerCase().trim();
    if (l === 'json' || l === 'application/json') {
      try {
        const parsed = typeof code === 'string' ? JSON.parse(code) : code;
        return JSON.stringify(parsed, null, 2);
      } catch {
        return code;
      }
    }
    return code;
  }, [code, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = useMemo(() => formattedCode.split('\n'), [formattedCode]);
  const lineCount = lines.length;
  const editorHeight = Math.min(Math.max(lineCount * 21 + 28, 80), maxHeight);

  const getMonacoLanguage = (lang: string): string => {
    const l = (lang || '').toLowerCase().trim();
    if (l === 'json' || l === 'application/json') return 'json';
    if (l === 'bash' || l === 'curl' || l === 'shell' || l === 'sh') return 'shell';
    if (l === 'javascript' || l === 'js') return 'javascript';
    if (l === 'typescript' || l === 'ts') return 'typescript';
    if (l === 'html' || l === 'xml') return 'xml';
    if (l === 'yaml' || l === 'yml') return 'yaml';
    return 'plaintext';
  };

  const handleEditorBeforeMount = (monaco: any) => {
    monaco.editor.defineTheme('postman-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'string.key.json', foreground: '9CDCFE', fontStyle: 'bold' },
        { token: 'string.value.json', foreground: 'CE9178' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'keyword.json', foreground: '569CD6', fontStyle: 'bold' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'delimiter', foreground: 'D4D4D4' },
      ],
      colors: {
        'editor.background': '#1E1E1E',
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

  // Process lines into tokens with indent guide support matching Postman & VS Code Dark+
  const renderedLines = useMemo(() => {
    const l = (language || '').toLowerCase().trim();
    const isJson = l === 'json' || l === 'application/json';
    const isCurl = l === 'curl' || l === 'bash' || l === 'shell' || l === 'sh';

    return lines.map((rawLine, lineIdx) => {
      // 1. Detect leading spaces for indent guide line
      const indentMatch = rawLine.match(/^(\s+)/);
      const leadingSpaces = indentMatch ? indentMatch[1].length : 0;
      const content = indentMatch ? rawLine.slice(leadingSpaces) : rawLine;
      const indentLevel = Math.floor(leadingSpaces / 2);

      // 2. Escape HTML entities
      let escapedContent = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // 3. Syntax highlight content
      if (isJson) {
        // Regex matches JSON keys, strings, booleans, null, numbers, punctuation
        const jsonRegex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}[\],:])/g;

        escapedContent = escapedContent.replace(jsonRegex, (match) => {
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              // JSON Key (Postman Sky Blue / Cyan: #9CDCFE)
              const keyPart = match.slice(0, -1);
              return `<span style="color: #9CDCFE; font-weight: 500;">${keyPart}</span><span style="color: #D4D4D4;">:</span>`;
            } else {
              // JSON String Value (Postman Warm Peach/Coral: #CE9178)
              return `<span style="color: #CE9178;">${match}</span>`;
            }
          } else if (/true|false/.test(match)) {
            // Booleans (Postman Blue: #569CD6)
            return `<span style="color: #569CD6; font-weight: bold;">${match}</span>`;
          } else if (/null/.test(match)) {
            // Null (Postman Blue: #569CD6)
            return `<span style="color: #569CD6; font-style: italic;">${match}</span>`;
          } else if (/^-?\d+/.test(match)) {
            // Numbers (Postman Sage Green: #B5CEA8)
            return `<span style="color: #B5CEA8;">${match}</span>`;
          } else {
            // Delimiters { } [ ] , : (Soft Gray: #D4D4D4)
            return `<span style="color: #D4D4D4;">${match}</span>`;
          }
        });
      } else if (isCurl) {
        escapedContent = escapedContent
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

      return {
        lineIdx,
        indentLevel,
        hasLeadingOddSpace: leadingSpaces % 2 !== 0,
        escapedContent: escapedContent || '&nbsp;',
      };
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

          {/* Language Badge */}
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

        {/* Right action controls */}
        <div className="flex items-center gap-2">
          {/* Monaco switch toggle button */}
          <button
            type="button"
            onClick={() => setUseMonaco(!useMonaco)}
            className={`no-print hidden sm:flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-mono border transition-all ${
              useMonaco
                ? 'bg-[#FF6C37]/20 border-[#FF6C37] text-[#FF6C37]'
                : 'bg-[#242424] border-[#333333] text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle between native Postman syntax highlighter and Monaco Editor"
          >
            <Cpu className="w-3 h-3" />
            <span>{useMonaco ? 'Monaco Active' : 'Monaco'}</span>
          </button>

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
      </div>

      {/* Code Display Area */}
      {useMonaco ? (
        <div className="py-2.5 bg-[#1E1E1E]">
          <MonacoEditor
            height={`${editorHeight}px`}
            language={getMonacoLanguage(language)}
            value={formattedCode}
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
        /* Instant authentic Postman Syntax Highlighter with Line Numbers & Indent Guides */
        <div
          className="py-3 px-1 overflow-x-auto text-[13px] leading-[21px] bg-[#1E1E1E] select-text flex"
          style={{
            maxHeight: `${maxHeight}px`,
            fontFamily: 'Consolas, "Lucida Console", "Courier New", monospace',
          }}
        >
          {/* Line Numbers Gutter */}
          {lineCount > 1 && (
            <div className="select-none text-right pr-3.5 pl-3 text-[#6E7681] border-r border-[#2d2d2d] bg-[#1E1E1E] font-mono shrink-0">
              {renderedLines.map((item) => (
                <div key={item.lineIdx} className="h-[21px] leading-[21px]">
                  {item.lineIdx + 1}
                </div>
              ))}
            </div>
          )}

          {/* Indent Guide Line & Code Tokens */}
          <div className="pl-3.5 pr-4 flex-1 font-mono">
            {renderedLines.map((item) => (
              <div
                key={item.lineIdx}
                className="flex items-center min-h-[21px] leading-[21px] whitespace-pre"
              >
                {/* Indent Guide Line(s) matching Postman / VS Code Dark+ */}
                {Array.from({ length: item.indentLevel }).map((_, guideIdx) => (
                  <span
                    key={guideIdx}
                    className="inline-block border-l border-[#3a3a3a] h-[19px] ml-1 mr-2.5 align-middle select-none shrink-0"
                    aria-hidden="true"
                  />
                ))}
                {item.hasLeadingOddSpace && <span className="inline-block w-[7px]">&nbsp;</span>}

                {/* Highlighted Tokens */}
                <span
                  dangerouslySetInnerHTML={{ __html: item.escapedContent }}
                  className="font-medium"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
