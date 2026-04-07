import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

const KEYWORDS = new Set([
  'int', 'float', 'double', 'char', 'void', 'long', 'short', 'unsigned', 'signed',
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return',
  'struct', 'typedef', 'enum', 'union', 'sizeof', 'static', 'const', 'extern', 'register',
  'volatile', 'goto', 'default', 'auto', 'inline', 'restrict',
]);

const TYPES = new Set(['int', 'float', 'double', 'char', 'void', 'long', 'short', 'unsigned']);

export function tokenize(code: string): Array<{ text: string; type: string }> {
  const tokens: Array<{ text: string; type: string }> = [];
  let i = 0;

  while (i < code.length) {
    // Preprocessor directives
    if (code[i] === '#') {
      let end = code.indexOf('\n', i);
      if (end === -1) end = code.length;
      tokens.push({ text: code.slice(i, end), type: 'preprocessor' });
      i = end;
      continue;
    }

    // Single-line comments
    if (code[i] === '/' && code[i + 1] === '/') {
      let end = code.indexOf('\n', i);
      if (end === -1) end = code.length;
      tokens.push({ text: code.slice(i, end), type: 'comment' });
      i = end;
      continue;
    }

    // Multi-line comments
    if (code[i] === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2);
      const close = end === -1 ? code.length : end + 2;
      tokens.push({ text: code.slice(i, close), type: 'comment' });
      i = close;
      continue;
    }

    // Strings
    if (code[i] === '"') {
      let j = i + 1;
      while (j < code.length && code[j] !== '"') {
        if (code[j] === '\\') j++;
        j++;
      }
      tokens.push({ text: code.slice(i, j + 1), type: 'string' });
      i = j + 1;
      continue;
    }

    // Character literals
    if (code[i] === "'") {
      let j = i + 1;
      while (j < code.length && code[j] !== "'") {
        if (code[j] === '\\') j++;
        j++;
      }
      tokens.push({ text: code.slice(i, j + 1), type: 'string' });
      i = j + 1;
      continue;
    }

    // Numbers
    if (/[0-9]/.test(code[i]) || (code[i] === '.' && /[0-9]/.test(code[i + 1]))) {
      let j = i;
      if (code[j] === '0' && (code[j + 1] === 'x' || code[j + 1] === 'X')) {
        j += 2;
        while (j < code.length && /[0-9a-fA-F]/.test(code[j])) j++;
      } else {
        while (j < code.length && /[0-9.]/.test(code[j])) j++;
        if (j < code.length && (code[j] === 'f' || code[j] === 'F' || code[j] === 'l' || code[j] === 'L')) j++;
      }
      tokens.push({ text: code.slice(i, j), type: 'number' });
      i = j;
      continue;
    }

    // Identifiers and keywords
    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) j++;
      const word = code.slice(i, j);
      if (KEYWORDS.has(word)) {
        tokens.push({ text: word, type: TYPES.has(word) ? 'type' : 'keyword' });
      } else if (j < code.length && code[j] === '(') {
        tokens.push({ text: word, type: 'function' });
      } else {
        tokens.push({ text: word, type: 'identifier' });
      }
      i = j;
      continue;
    }

    // Operators and punctuation
    tokens.push({ text: code[i], type: 'plain' });
    i++;
  }

  return tokens;
}

interface HighlightedLineProps {
  code: string;
  lineNumber?: number;
  highlightLine?: number;
}

export const HighlightedLine: React.FC<HighlightedLineProps> = React.memo(({
  code, lineNumber, highlightLine,
}) => {
  const tokens = useMemo(() => tokenize(code), [code]);
  const isHighlighted = lineNumber === highlightLine;

  return (
    <div
      className={cn(
        'flex leading-relaxed',
        isHighlighted && 'bg-red-500/15 rounded'
      )}
    >
      {lineNumber !== undefined && (
        <span className="inline-block w-10 text-right pr-4 select-none opacity-40 shrink-0">
          {lineNumber}
        </span>
      )}
      <span className="flex-1">
        {tokens.map((token, i) => (
          <span key={i} className={cn(
            token.type === 'keyword' && 'syntax-keyword',
            token.type === 'type' && 'syntax-type',
            token.type === 'string' && 'syntax-string',
            token.type === 'number' && 'syntax-number',
            token.type === 'comment' && 'syntax-comment',
            token.type === 'preprocessor' && 'syntax-preprocessor',
            token.type === 'function' && 'syntax-function',
          )}>
            {token.text}
          </span>
        ))}
      </span>
    </div>
  );
});
HighlightedLine.displayName = 'HighlightedLine';

interface CodeBlockProps {
  code: string;
  language?: string;
  highlightLine?: number;
  showLineNumbers?: boolean;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = React.memo(({
  code, language = 'c', highlightLine, showLineNumbers = true, className,
}) => {
  const lines = code.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className={cn('code-wrapper relative group', className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 body:not(.dark):border-black/10">
        <span className="text-xs opacity-50 uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className="text-xs opacity-50 hover:opacity-100 transition-opacity"
        >
          Copy
        </button>
      </div>
      <div className="code-block p-4">
        {lines.map((line, i) => (
          <HighlightedLine
            key={i}
            code={line}
            lineNumber={showLineNumbers ? i + 1 : undefined}
            highlightLine={highlightLine}
          />
        ))}
      </div>
    </div>
  );
});
CodeBlock.displayName = 'CodeBlock';
