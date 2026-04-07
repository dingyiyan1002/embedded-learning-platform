import React, { memo, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CodeBlock, tokenize } from './SyntaxHighlighter';

/** token type → syntax CSS class */
const TCLASS: Record<string, string> = {
  keyword: 'syntax-keyword',
  type: 'syntax-type',
  string: 'syntax-string',
  number: 'syntax-number',
  comment: 'syntax-comment',
  preprocessor: 'syntax-preprocessor',
  function: 'syntax-function',
};

interface LabViewProps {
  isDarkMode: boolean;
}

/* ===== 指针与内存 ===== */
const PointerSandboxDemo = memo(({ isDarkMode }: { isDarkMode: boolean }) => (
  <div className="glass rounded-xl p-6">
    <h3 className="text-lg font-bold mb-4 text-amber-400">指针与内存</h3>
    <p className="text-sm opacity-60 mb-4">可视化展示变量地址、指针指向关系、解引用操作</p>
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="viz-container rounded-lg p-4 text-center">
        <div className="text-xs opacity-50 mb-2">变量 a</div>
        <div className="text-2xl font-bold text-blue-400">42</div>
        <div className="text-xs opacity-40 mt-1">地址: 0x7ffc</div>
      </div>
      <div className="viz-container rounded-lg p-4 text-center">
        <div className="text-xs opacity-50 mb-2">指针 p</div>
        <div className="text-2xl font-bold text-amber-400">&rarr; 0x7ffc</div>
        <div className="text-xs opacity-40 mt-1">*p = 42</div>
      </div>
    </div>
    <div className="text-xs opacity-40 text-center">多级指针和野指针演示功能开发中...</div>
  </div>
));
PointerSandboxDemo.displayName = 'PointerSandboxDemo';

/* ===== 函数栈帧 ===== */
const StackFrameDemo = memo(({ isDarkMode }: { isDarkMode: boolean }) => (
  <div className="glass rounded-xl p-6">
    <h3 className="text-lg font-bold mb-4 text-amber-400">函数栈帧</h3>
    <p className="text-sm opacity-60 mb-4">可视化函数调用栈的入栈/出栈过程</p>
    <div className="space-y-2">
      {['main() 栈帧', 'func() 栈帧', 'helper() 栈帧'].map((frame, i) => (
        <div key={i} className="viz-stack-frame rounded-lg p-3 text-center text-sm">{frame}</div>
      ))}
    </div>
    <div className="text-xs opacity-40 text-center mt-4">递归可视化功能开发中...</div>
  </div>
));
StackFrameDemo.displayName = 'StackFrameDemo';

/* ===== COW 机制 ===== */
const COWDemo = memo(() => (
  <div className="glass rounded-xl p-6">
    <h3 className="text-lg font-bold mb-4 text-amber-400">COW 写时复制</h3>
    <p className="text-sm opacity-60 mb-4">fork() 与写时复制机制的5步动画演示</p>
    <div className="flex flex-wrap gap-3 justify-center">
      {[['父进程', '数据页', 'bg-blue-500/20'], ['父进程', '代码页', 'bg-green-500/20'], ['子进程', '数据页', 'bg-purple-500/20']].map(([label, page, color], i) => (
        <div key={i} className="w-24 h-16 rounded-lg flex items-center justify-center text-xs text-center border border-white/10">
          <div><div className="font-semibold">{label}</div><div className={`${color} rounded px-1 mt-1`}>{page}</div></div>
        </div>
      ))}
    </div>
    <div className="text-xs opacity-40 text-center mt-4">动画播放功能开发中...</div>
  </div>
));
COWDemo.displayName = 'COWDemo';

/* ===== 位运算开关 ===== */
const BitSwitchDemo = memo(({ isDarkMode }: { isDarkMode: boolean }) => {
  const [switches, setSwitches] = useState([0, 0, 0, 0, 0, 0, 0, 0]);
  const toggle = (i: number) => {
    const n = [...switches];
    n[i] = n[i] ? 0 : 1;
    setSwitches(n);
  };
  const value = switches.reduce((a, b, i) => a + b * Math.pow(2, i), 0);

  return (
    <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-purple-500/30' : 'bg-gradient-to-br from-white via-purple-50 to-slate-100 border border-purple-200'}`}>
      <h3 className="text-lg font-bold mb-4 text-amber-400">位运算开关箱</h3>
      <div className="flex justify-center gap-2 mb-4">
        {switches.map((s, i) => (
          <button key={i} onClick={() => toggle(i)} aria-label={`位 ${i}，权重 ${Math.pow(2, i)}`}
            className={`w-10 h-14 rounded-lg border-2 transition-all text-xs cursor-pointer ${s
              ? 'bg-amber-400 border-amber-500 text-black font-bold'
              : isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-400' : 'bg-white border-slate-300 text-slate-500'}`}
          >
            <div className="mt-4">{Math.pow(2, i)}</div>
          </button>
        ))}
      </div>
      <div className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-black/30' : 'bg-white/80'}`}>
        <div className="text-sm font-mono">{switches.join('')} = <span className="text-amber-400 font-bold">{value}</span> = 0x{value.toString(16).toUpperCase().padStart(2, '0')}</div>
      </div>
    </div>
  );
});
BitSwitchDemo.displayName = 'BitSwitchDemo';

/* ===== 内存对齐 ===== */
const StructPackerDemo = memo(() => (
  <div className="glass rounded-xl p-6">
    <h3 className="text-lg font-bold mb-4 text-amber-400">内存对齐拖拽游戏</h3>
    <p className="text-sm opacity-60 mb-4">拖拽字段到内存格子中，检查对齐规则</p>
    <div className="flex flex-wrap gap-2 mb-4">
      {[{ t: 'char', s: 1, c: 'bg-blue-500/20' }, { t: 'short', s: 2, c: 'bg-green-500/20' }, { t: 'int', s: 4, c: 'bg-amber-500/20' }, { t: 'long', s: 8, c: 'bg-red-500/20' }].map(v => (
        <div key={v.t} className={`px-3 py-2 rounded border border-white/10 text-xs ${v.c}`}>{v.t} ({v.s}B)</div>
      ))}
    </div>
    <div className="grid grid-cols-8 gap-0.5">
      {Array.from({ length: 32 }, (_, i) => (
        <div key={i} className="viz-exec-cell h-6 rounded text-center text-xs leading-6">{i}</div>
      ))}
    </div>
    <div className="text-xs opacity-40 text-center mt-4">拖拽功能开发中...</div>
  </div>
));
StructPackerDemo.displayName = 'StructPackerDemo';

/* ===== 在线代码运行器 ===== */
const PRESETS = [
  { name: 'Hello World', code: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}' },
  { name: '指针基础', code: '#include <stdio.h>\n\nint main() {\n    int a = 42;\n    int *p = &a;\n    *p = 100;\n    printf("a = %d\\n", a);\n    return 0;\n}' },
  { name: '冒泡排序', code: '#include <stdio.h>\n\nint main() {\n    int arr[] = {64, 34, 25, 12, 22};\n    int n = 5;\n    for (int i = 0; i < n-1; i++)\n        for (int j = 0; j < n-i-1; j++)\n            if (arr[j] > arr[j+1]) {\n                int t = arr[j]; arr[j] = arr[j+1]; arr[j+1] = t;\n            }\n    for (int i = 0; i < n; i++) printf("%d ", arr[i]);\n    return 0;\n}' },
  { name: '链表', code: '#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct Node { int data; struct Node *next; } Node;\n\nint main() {\n    Node *head = malloc(sizeof(Node));\n    head->data = 1;\n    head->next = malloc(sizeof(Node));\n    head->next->data = 2;\n    head->next->next = NULL;\n    for (Node *p = head; p; p = p->next)\n        printf("%d ", p->data);\n    return 0;\n}' },
  { name: '递归阶乘', code: '#include <stdio.h>\n\nint factorial(int n) {\n    if (n <= 1) return 1;\n    return n * factorial(n - 1);\n}\n\nint main() {\n    printf("5! = %d\\n", factorial(5));\n    return 0;\n}' },
];

interface RunResult { success: boolean; output: string; type: string; errorLines?: number[]; smartTips?: Array<{ title: string; hint: string }> }

const CodeRunnerDemo = memo(({ isDarkMode }: { isDarkMode: boolean }) => {
  const [code, setCode] = useState(PRESETS[0].code);
  const [stdinInput, setStdinInput] = useState('');
  const [result, setResult] = useState<RunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  // 语法高亮 tokens
  const tokens = useMemo(() => tokenize(code), [code]);

  // 同步滚动
  const syncScroll = useCallback(() => {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setResult(null);
    try {
      const res = await fetch('http://localhost:3001/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, stdin: stdinInput }),
      });
      const data: RunResult = await res.json();
      setResult(data);
    } catch {
      setResult({ success: false, output: '无法连接到 GCC 后端服务。\n请确保已启动: cd server && npm start', type: 'connection_error' });
    }
    setIsRunning(false);
  }, [code, stdinInput]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const t = e.target as HTMLTextAreaElement;
      const s = t.selectionStart;
      const val = t.value;
      setCode(val.substring(0, s) + '    ' + val.substring(t.selectionEnd));
      requestAnimationFrame(() => { t.selectionStart = t.selectionEnd = s + 4; });
    }
  }, [handleRun]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).catch(() => {});
  }, [code]);

  // Line count
  const lineCount = useMemo(() => code.split('\n').length, [code]);

  return (
    <div className={isFullscreen ? 'fixed inset-0 z-50 bg-background p-4' : 'glass rounded-xl p-6'}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-amber-400">在线代码运行</h3>
        <div className="flex gap-2">
          <select
            value=""
            onChange={e => { const p = PRESETS.find(pr => pr.name === e.target.value); if (p) setCode(p.code); }}
            className={`px-2 py-1 rounded text-xs border ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-300'}`}
          >
            <option value="">加载预设...</option>
            {PRESETS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
          <button
            onClick={() => setIsFullscreen(f => !f)}
            className={`px-2 py-1 rounded text-xs border ${isDarkMode ? 'border-slate-600' : 'border-slate-300'}`}
          >{isFullscreen ? '退出全屏' : '全屏'}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor */}
        <div>
          <div className={`rounded-lg border overflow-hidden ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}>
            <div className={`flex items-center justify-between px-3 py-1.5 text-xs ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <span className="opacity-50">main.c</span>
              <span className="opacity-30">|</span>
              <span className="opacity-40">{lineCount} 行</span>
              <div className="flex-1" />
              <button onClick={handleCopy} className="opacity-50 hover:opacity-100 transition-opacity">复制</button>
            </div>
            {/* Editor area: line numbers + syntax highlight overlay + transparent textarea */}
            <div className="relative">
              {/* Line numbers */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-10 text-right pr-3 pt-4 select-none font-mono text-xs leading-relaxed z-10 pointer-events-none ${isDarkMode ? 'bg-slate-900 text-slate-600 border-r border-slate-700' : 'bg-white text-slate-400 border-r border-slate-200'}`}
              >
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              {/* Syntax highlight overlay (behind textarea) */}
              <pre
                ref={highlightRef}
                className={`absolute inset-0 pt-4 pl-12 pr-4 font-mono text-sm leading-relaxed overflow-hidden pointer-events-none whitespace-pre-wrap break-all ${isDarkMode ? 'text-slate-300 bg-slate-900' : 'text-slate-800 bg-white'}`}
                aria-hidden="true"
              >
                {tokens.map((token, i) => (
                  <span key={i} className={TCLASS[token.type] ?? ''}>{token.text}</span>
                ))}
                {/* extra newline to keep scroll in sync */}
                {'\n'}
              </pre>
              {/* Actual textarea (transparent text, visible caret) */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                onScroll={syncScroll}
                rows={isFullscreen ? 25 : 12}
                spellCheck={false}
                className={`relative w-full p-4 pl-12 font-mono text-sm leading-relaxed outline-none resize-y bg-transparent ${isDarkMode ? 'caret-amber-400' : 'caret-amber-600'}`}
                style={{ color: 'transparent', WebkitTextFillColor: 'transparent' }}
                placeholder=""
              />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-sm font-medium transition-colors text-white"
            >{isRunning ? '编译中...' : '运行 (Ctrl+Enter)'}</button>
            <div className="flex-1">
              <input
                value={stdinInput}
                onChange={e => setStdinInput(e.target.value)}
                placeholder="stdin 输入（可选）"
                className={`w-full px-3 py-2 rounded border text-sm outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
              />
            </div>
          </div>
        </div>

        {/* Output */}
        <div>
          <div className={`rounded-lg border overflow-hidden ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}>
            <div className={`px-3 py-1.5 text-xs ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <span className="opacity-50">输出</span>
            </div>
            <div className={`p-4 font-mono text-sm min-h-[200px] whitespace-pre-wrap ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
              {result ? (
                <div>
                  {result.smartTips && result.smartTips.length > 0 && (
                    <div className="mb-3 space-y-1">
                      {result.smartTips.map((tip, i) => (
                        <div key={i} className="text-amber-400 text-xs">
                          <strong>{tip.title}</strong>: {tip.hint}
                        </div>
                      ))}
                    </div>
                  )}
                  <pre className={result.success ? 'text-emerald-400' : 'text-red-400'}>{result.output}</pre>
                </div>
              ) : (
                <span className="opacity-30">点击运行查看结果...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
CodeRunnerDemo.displayName = 'CodeRunnerDemo';

/* ===== 主视图 ===== */
export const LabView: React.FC<LabViewProps> = memo(({ isDarkMode }) => (
  <div className="max-w-6xl mx-auto px-4 py-8">
    <h1 className="text-2xl font-bold mb-6">互动实验室</h1>
    <Tabs defaultValue="runner">
      <TabsList className="mb-4 flex-wrap h-auto gap-1">
        <TabsTrigger value="runner">代码运行</TabsTrigger>
        <TabsTrigger value="pointer">指针内存</TabsTrigger>
        <TabsTrigger value="stack">函数栈帧</TabsTrigger>
        <TabsTrigger value="cow">COW机制</TabsTrigger>
        <TabsTrigger value="bits">位运算</TabsTrigger>
        <TabsTrigger value="struct">内存对齐</TabsTrigger>
      </TabsList>
      <TabsContent value="runner"><CodeRunnerDemo isDarkMode={isDarkMode} /></TabsContent>
      <TabsContent value="pointer"><PointerSandboxDemo isDarkMode={isDarkMode} /></TabsContent>
      <TabsContent value="stack"><StackFrameDemo isDarkMode={isDarkMode} /></TabsContent>
      <TabsContent value="cow"><COWDemo /></TabsContent>
      <TabsContent value="bits"><BitSwitchDemo isDarkMode={isDarkMode} /></TabsContent>
      <TabsContent value="struct"><StructPackerDemo /></TabsContent>
    </Tabs>
  </div>
));
LabView.displayName = 'LabView';
