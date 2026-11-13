import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, Maximize2, Minimize2, Play, RotateCcw } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange: (next: string) => void;
  onReset?: () => void;
  onRunShortcut?: () => void;
  heightClass?: string;
  readOnly?: boolean;
  label?: string;
  highContrast?: boolean;
  allowFullscreen?: boolean;
}

const PYTHON_KEYWORDS = new Set([
  'def',
  'return',
  'if',
  'elif',
  'else',
  'for',
  'while',
  'in',
  'import',
  'from',
  'as',
  'class',
  'try',
  'except',
  'with',
  'True',
  'False',
  'None',
  'and',
  'or',
  'not',
  'lambda',
  'pass',
  'break',
  'continue',
]);

const PYTHON_BUILTINS = new Set([
  'print',
  'len',
  'range',
  'round',
  'min',
  'max',
  'sum',
  'abs',
  'float',
  'int',
  'str',
  'list',
  'dict',
  'emit_rover_path',
  'emit_arm_joints',
]);

function highlightPythonLine(line: string): React.ReactNode[] {
  if (!line) return [' '];

  const commentIdx = (() => {
    let inSingle = false;
    let inDouble = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === "'" && !inDouble && line[i - 1] !== '\\') inSingle = !inSingle;
      else if (ch === '"' && !inSingle && line[i - 1] !== '\\') inDouble = !inDouble;
      else if (ch === '#' && !inSingle && !inDouble) return i;
    }
    return -1;
  })();

  const codePart = commentIdx >= 0 ? line.slice(0, commentIdx) : line;
  const commentPart = commentIdx >= 0 ? line.slice(commentIdx) : '';

  const tokens = codePart.split(/("[^"]*"|'[^']*'|\b[A-Za-z_][A-Za-z0-9_]*\b|\b\d+(?:\.\d+)?\b)/g);

  const nodes: React.ReactNode[] = tokens.map((tok, i) => {
    if (!tok) return null;
    if ((tok.startsWith('"') && tok.endsWith('"')) || (tok.startsWith("'") && tok.endsWith("'"))) {
      return (
        <span key={i} className="text-emerald-300">
          {tok}
        </span>
      );
    }
    if (PYTHON_KEYWORDS.has(tok)) {
      return (
        <span key={i} className="text-[#84E179] font-medium">
          {tok}
        </span>
      );
    }
    if (PYTHON_BUILTINS.has(tok)) {
      return (
        <span key={i} className="text-sky-300">
          {tok}
        </span>
      );
    }
    if (/^\d+(?:\.\d+)?$/.test(tok)) {
      return (
        <span key={i} className="text-amber-300">
          {tok}
        </span>
      );
    }
    return (
      <span key={i} className="text-slate-100">
        {tok}
      </span>
    );
  });

  if (commentPart) {
    nodes.push(
      <span key="comment" className="text-slate-500 italic">
        {commentPart}
      </span>
    );
  }

  return nodes;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  onReset,
  onRunShortcut,
  heightClass = 'h-72',
  readOnly = false,
  label = 'main.py',
  highContrast = false,
  allowFullscreen = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullscreen]);

  const lines = value.split('\n');

  const syncScroll = () => {
    if (!textareaRef.current) return;
    const { scrollTop, scrollLeft } = textareaRef.current;
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = scrollTop;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && onRunShortcut) {
      e.preventDefault();
      onRunShortcut();
      return;
    }
    if (e.key === 'Tab' && !readOnly) {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const next = value.substring(0, start) + '    ' + value.substring(end);
      onChange(next);
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 4;
          textareaRef.current.selectionEnd = start + 4;
        }
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={`${
        isFullscreen
          ? 'fixed inset-0 z-50 flex flex-col rounded-none border-0'
          : 'rounded-[10px] border'
      } overflow-hidden ${
        highContrast ? 'bg-[#090D16] border-slate-700' : 'bg-[#0F172A] border-slate-800'
      }`}
    >
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between gap-2 px-3.5 py-2 bg-[#111827] border-b border-slate-800 text-xs text-slate-300 shrink-0">
        <div className="flex items-center gap-2.5 font-mono min-w-0">
          <span className="font-medium text-slate-200 truncate">{label}</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400 whitespace-nowrap">Python 3.10</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isFullscreen && onRunShortcut && (
            <button
              type="button"
              onClick={onRunShortcut}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              title="Run code (Cmd/Ctrl+Enter)"
            >
              <Play className="w-3 h-3" />
              <span>Run</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          {onReset && !readOnly && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              title="Reset to starter code"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Code</span>
            </button>
          )}
          {allowFullscreen && (
            <button
              type="button"
              onClick={() => setIsFullscreen((v) => !v)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              aria-label={isFullscreen ? 'Exit fullscreen code editor' : 'Fullscreen code editor'}
              title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen editor'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-[#84E179]" />
                  <span>Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Fullscreen</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Editor Body */}
      <div className={`relative flex ${isFullscreen ? 'flex-1 min-h-0' : heightClass} font-mono text-[13px] leading-[1.6]`}>
        {/* Line Numbers Gutter */}
        <div
          ref={gutterRef}
          aria-hidden="true"
          className="w-11 py-3 pr-2.5 text-right select-none overflow-hidden bg-[#111827]/70 text-slate-500 border-r border-slate-800/80 tabular-nums shrink-0"
        >
          {lines.map((_, idx) => (
            <div key={idx}>{idx + 1}</div>
          ))}
        </div>

        {/* Highlighted + Editable Overlay */}
        <div className="relative flex-1 overflow-hidden">
          <pre
            ref={preRef}
            aria-hidden="true"
            className="absolute inset-0 m-0 p-3 overflow-hidden pointer-events-none whitespace-pre font-mono text-[13px] leading-[1.6]"
          >
            {lines.map((line, idx) => (
              <div key={idx}>{highlightPythonLine(line)}</div>
            ))}
          </pre>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={syncScroll}
            onKeyDown={handleKeyDown}
            readOnly={readOnly}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            aria-label={`Python code editor for ${label}`}
            className="relative z-10 w-full h-full m-0 p-3 bg-transparent text-transparent caret-[#53b947] resize-none focus:outline-none overflow-auto ide-scroll whitespace-pre font-mono text-[13px] leading-[1.6]"
          />
        </div>
      </div>
    </div>
  );
};
