import React, { useState, useCallback, useRef, memo, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, Check, Copy, FileCode, Terminal, X, Keyboard, Type, ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { typingPresets } from '@/data/importedPresets';
import { tokenize } from './SyntaxHighlighter';

/* ============================================================
   虚拟键盘布局定义（标准 104 键）
   ============================================================ */

interface KeyDef {
  label: string;
  code: string;       /* e.key / e.code */
  width?: number;     /* 1=标准, 2=双宽 */
  type?: 'modifier' | 'special' | 'space';
}

const KEYBOARD_ROWS: KeyDef[][] = [
  // Row 0: Esc + F-row
  [{label:'Esc', code:'Escape', width:2}, {label:'F1', code:'F1'}, {label:'F2', code:'F2'},
   {label:'F3', code:'F3'}, {label:'F4', code:'F4'}, {label:'F5', code:'F5'},
   {label:'F6', code:'F6'}, {label:'F7', code:'F7'}, {label:'F8', code:'F8'},
   {label:'F9', code:'F9'}, {label:'F10', code:'F10'}, {label:'F11', code:'F11'},
   {label:'F12', code:'F12'}],
  // Row 1: number row
  [{label:'`', code:'Backquote'}, {'1':'!',code:'Digit1'},{'2':'@',code:'Digit2'},{'3':'#',code:'Digit3'},
   {'4':'$',code:'Digit4'},{'5':'%',code:'Digit5'},{'6':'^',code:'Digit6'},{'7':'&',code:'Digit7'},
   {'8':'*',code:'Digit8'},{'9':'(',code:'Digit9'},{')':')',code:'Digit0'},{'-':'_',code:'Minus'},
   {'=':'=',code:'Equal'},{width:7,label:'',code:'Backspace',type:'special'}],
  // Row 2: QWERTY row
  [{width:1.5,label:'Tab',code:'Tab',type:'modifier'},'Q','W','E','R','T','Y','U','I','O','P',
   {'[':'[',code:'BracketLeft'},{']':']',code:'BracketRight'},{width:1.5,'\\':'\\',code:'Backslash'}],
  // Row 3: ASDF row
  [{width:1.75,label:'Caps',code:'CapsLock',type:'modifier'},'A','S','D','F','G','H','J','K','L',
   {';':';',code:'Semicolon'},{"'":"'",code:'Quote'},{width:2.25,label:'Enter ↵',code:'Enter',type:'special'}],
  // Row 4: ZXCV row
  [{width:2.25,label:'Shift ⇧',code:'ShiftLeft',type:'modifier'},'Z','X','C','V','B','N','M',
   {',':',',code:'Comma'},{'.':'.',code:'Period'},{'/':'/',code:'Slash'},
   {width:2.75,label:'Shift ⇧',code:'ShiftRight',type:'modifier'}],
  // Row 5: bottom row
  [{width:1.25,label:'Ctrl',code:'ControlLeft',type:'modifier'},
   {width:1.25,label:'Win',code:'MetaLeft',type:'modifier'},
   {width:1.25,label:'Alt',code:'AltLeft',type:'modifier'},
   {width:6.25,label:'',code:'Space',type:'space'},
   {width:1.25,label:'Alt',code:'AltRight',type:'modifier'},
   {width:1.25,label:'Fn',code:'Fn',type:'modifier'},
   {width:1.25,label:'Ctrl',code:'ControlRight',type:'modifier'},
   {width:1,label:'←',code:'ArrowLeft',type:'special'},
   {width:1,label:'↓↑',code:'ArrowDown',type:'special'},
   {width:1,label:'→',code:'ArrowRight',type:'special'}],
];

// 解析 key def 为统一格式
function parseKey(k: string | KeyDef): KeyDef {
  if (typeof k === 'string') return { label: k, code: `Key${k.toUpperCase()}` };
  return { ...k };
}

/** 所有有效按键的 code 集合 */
const VALID_KEY_CODES = new Set(KEYBOARD_ROWS.flat().map(parseKey).map(k => k.code));

/* ============================================================
   虚拟键盘组件（独立 memo）
   ============================================================ */

interface VirtualKeyboardProps {
  isDarkMode: boolean;
  activeKeys: Set<string>;
  fontSize: number;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = memo(({ isDarkMode, activeKeys }) => {
  const baseKeyCls = `rounded-md flex items-center justify-center font-mono transition-all duration-100 select-none ${
    isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-300'
  } border`;

  return (
    <div className={`rounded-xl p-3 border ${isDarkMode ? 'bg-[#0d1117] border-slate-700' : 'bg-gray-50 border-slate-200'}`}>
      <div className="flex items-center gap-2 mb-2 px-1">
        <Keyboard className="w-3.5 h-3.5 opacity-40" />
        <span className="text-xs opacity-40">虚拟键盘 — 实时按键反馈</span>
        {activeKeys.size > 0 && (
          <span className="ml-auto text-xs text-emerald-400 animate-pulse">
            按下中: {Array.from(activeKeys).slice(0, 3).join(' · ')}{activeKeys.size > 3 ? ` (+${activeKeys.size - 3})` : ''}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-0.5 justify-center">
            {row.map((k, ki) => {
              const def = parseKey(k);
              const isActive = activeKeys.has(def.code);
              const w = def.width ?? 1;
              let displayLabel = typeof k === 'string'
                ? (typeof (k as Record<string,string>) === 'object' ? '' : k)
                : def.label;
              if (typeof k === 'object' && !Array.isArray(k) && 'label' in k) {
                // already parsed
              }
              if (typeof k !== 'string' || k.length === 1) {
                displayLabel = typeof k === 'string' ? k : def.label;
              }

              return (
                <button
                  key={`${ri}-${ki}`}
                  aria-label={def.label}
                  className={`
                    ${baseKeyCls}
                    ${isActive
                      ? isDarkMode
                        ? 'bg-emerald-500/30 border-emerald-500 shadow-lg shadow-emerald-500/20 scale-95 z-10'
                        : 'bg-emerald-200 border-emerald-400 shadow-md scale-95 z-10'
                      : ''
                    }
                    ${def.type === 'modifier' ? (isDarkMode ? 'text-blue-300 bg-slate-600/80' : 'text-blue-700 bg-blue-50/80') : ''}
                    ${def.type === 'space' ? (isDarkMode ? 'bg-slate-600/60' : 'bg-slate-200/60') : ''}
                    ${def.type === 'special' ? (isDarkMode ? 'text-amber-300 bg-slate-650/80' : 'text-amber-700 bg-amber-50/80') : ''}
                  `}
                  style={{ width: `${w * (isDarkMode ? 28 : 32)}px`, height: isDarkMode ? 28 : 34 }}
                >
                  <span className={`text-xs ${isActive ? (isDarkMode ? 'text-emerald-300 font-bold' : 'text-emerald-800 font-bold') : (isDarkMode ? 'opacity-70' : '')}`}>
                    {displayLabel}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
});
VirtualKeyboard.displayName = 'VirtualKeyboard';

/* ============================================================
   主组件：CodeTypingPractice
   ============================================================ */

interface CodeTypingPracticeProps {
  isDarkMode: boolean;
}

interface RunResult {
  success: boolean;
  output: string;
  type: string;
  smartTips?: Array<{ title: string; hint: string }>;
}

const DIFFICULTY_LABELS: Record<string, string> = { beginner: '入门', basic: '基础', intermediate: '中级', advanced: '高级' };
const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'text-green-400', basic: 'text-blue-400', intermediate: 'text-amber-400', advanced: 'text-red-400',
};

/** token → CSS 类名 */
const TOKEN_CLASS: Record<string, string> = {
  keyword: 'syntax-keyword', type: 'syntax-type', string: 'syntax-string',
  number: 'syntax-number', comment: 'syntax-comment', preprocessor: 'syntax-preprocessor',
  function: 'syntax-function', plain: '', identifier: '',
};

export const CodeTypingPractice: React.FC<CodeTypingPracticeProps> = memo(({ isDarkMode }) => {
  // === 基础状态 ===
  const [selectedId, setSelectedId] = useState(typingPresets[0].id);
  const preset = typingPresets.find(p => p.id === selectedId) || typingPresets[0];
  const [typed, setTyped] = useState('');
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);

  // === 字体大小 ===
  const [fontSize, setFontSize] = useState(14); // 12, 14, 16, 18, 20

  // === 虚拟键盘 ===
  const [showKbd, setShowKbd] = useState(true);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [lastKeyPressed, setLastKeyPressed] = useState('');

  // === GCC 运行器 ===
  const [showRunner, setShowRunner] = useState(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [isRunningGcc, setIsRunningGcc] = useState(false);

  // === Refs ===
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lineNumRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number>(0);
  const startTimeRef = useRef(0);

  const code = preset.code;
  const codeLines = useMemo(() => code.split('\n'), [code]);
  const totalLines = codeLines.length;

  // === 语法高亮 tokens & char map ===
  const tokens = useMemo(() => tokenize(code), [code]);
  const charTokenMap = useMemo(() => {
    const map = new Int8Array(code.length);
    let pos = 0;
    const ids: Record<string, number> = { keyword:1, type:2, string:3, number:4, comment:5, preprocessor:6, function:7 };
    for (const token of tokens) {
      for (let k = 0; k < token.text.length && pos < code.length; k++, pos++) map[pos] = ids[token.type] ?? 0;
    }
    return map;
  }, [code, tokens]);

  const charClass = useCallback((idx: number) => {
    switch (charTokenMap[idx]) {
      case 1: return 'syntax-keyword'; case 2: return 'syntax-type'; case 3: return 'syntax-string';
      case 4: return 'syntax-number'; case 5: return 'syntax-comment'; case 6: return 'syntax-preprocessor';
      case 7: return 'syntax-function'; default: return '';
    }
  }, [charTokenMap]);

  // === 全局键盘监听（虚拟键盘） ===
  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      // 忽略 textarea 内的 Tab 等已处理的键
      setActiveKeys(prev => new Set(prev).add(e.code));
      setLastKeyPressed(e.key);
      // 300ms 后自动释放（处理某些 keyup 不触发的情况）
      setTimeout(() => {
        setActiveKeys(prev => {
          const next = new Set(prev);
          next.delete(e.code);
          return next;
        });
      }, 300);
    };
    const handleUp = (e: KeyboardEvent) => {
      setActiveKeys(prev => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => { window.removeEventListener('keydown', handleDown); window.removeEventListener('keyup', handleUp); };
  }, []);

  // === 计时器 ===
  useEffect(() => {
    if (started && !paused && !completed) {
      timerRef.current = window.setInterval(() => setElapsed(Date.now() - startTimeRef.current), 100);
      return () => clearInterval(timerRef.current);
    }
  }, [started, paused, completed]);

  // === 统计 ===
  const stats = useMemo(() => {
    if (!started) return { wpm: 0, accuracy: 100, time: 0 };
    const time = elapsed / 1000;
    const chars = typed.length;
    const correct = typed.split('').filter((c, i) => c === code[i]).length;
    const accuracy = chars > 0 ? Math.round((correct / chars) * 100) : 100;
    const wpm = time > 0 ? Math.round((chars / 5) / (time / 60)) : 0;
    return { wpm, accuracy, time: Math.round(time) };
  }, [typed, elapsed, started, code]);

  // === 输入处理 ===
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (completed) return;
    const val = e.target.value;
    if (val.length > code.length) return;
    setTyped(val);
    if (!started) { setStarted(true); startTimeRef.current = Date.now(); }
    if (val.length >= code.length) { setCompleted(true); clearInterval(timerRef.current); }
  }, [code, started, completed]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const t = e.currentTarget;
      const s = t.selectionStart;
      const end = t.selectionEnd;
      setTyped(val => val.substring(0, s) + '\t' + val.substring(end));
      requestAnimationFrame(() => { t.selectionStart = t.selectionEnd = s + 1; });
    }
  }, []);

  // === 工具函数 ===
  const handleReset = useCallback(() => {
    setTyped(''); setStarted(false); setPaused(false); setCompleted(false);
    setElapsed(0); setCopied(false); setShowRunner(false); setRunResult(null);
    setActiveKeys(new Set()); setLastKeyPressed('');
    clearInterval(timerRef.current);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const handleSelect = useCallback((id: string) => { setSelectedId(id); handleReset(); }, [handleReset]);
  const handlePause = useCallback(() => setPaused(p => !p), []);
  const handleCopy = useCallback(() => navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => {}), [code]);
  const syncScroll = useCallback(() => { if (lineNumRef.current && inputRef.current) lineNumRef.current.scrollTop = inputRef.current.scrollTop; }, []);

  // === 字体大小调整 ===
  const changeFontSize = useCallback((delta: number) => setFontSize(s => Math.min(Math.max(s + delta, 11), 26)), []);

  // === 左侧渲染 ===
  const renderCodePanel = () => {
    let charIdx = 0;
    return codeLines.map((_, lineNum) => {
      const line = codeLines[lineNum];
      const chars: React.ReactNode[] = [];
      for (let c = 0; c < line.length; c++) {
        const gi = charIdx + c;
        let sc = '';
        if (gi < typed.length) sc = typed[gi] === code[gi] ? 'text-emerald-400' : 'bg-red-500/40 text-red-300 line-through';
        else if (gi === typed.length && started && !paused) sc = 'bg-amber-400/50 animate-pulse';
        const syn = gi >= typed.length ? charClass(gi) : '';
        chars.push(<span key={gi} className={`${sc} ${syn}`}>{code[gi]}</span>);
      }
      charIdx += line.length + 1;
      return (
        <div key={lineNum} className="flex leading-[1.7]">
          <span className="inline-block w-10 text-right pr-4 select-none opacity-30 shrink-0 text-xs">{lineNum + 1}</span>
          <span className="flex-1">{chars}</span>
        </div>
      );
    });
  };

  const typedLines = useMemo(() => typed.split('\n'), [typed]);

  // === GCC 运行 ===
  const handleRun = useCallback(async () => {
    setIsRunningGcc(true); setRunResult(null);
    try {
      const res = await fetch('http://localhost:3001/api/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, stdin: '' }) });
      setRunResult(await res.json());
    } catch { setRunResult({ success: false, output: '无法连接到 GCC 后端服务。\n\n请先在终端中启动后端:\ncd server && npm start', type: 'connection_error' }); }
    setIsRunningGcc(false);
  }, [code]);

  // === 样式常量 ===
  const headerBg = isDarkMode ? 'bg-slate-800' : 'bg-slate-100';

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden">
      {/* ===== Toolbar ===== */}
      <div className={`flex items-center gap-3 px-4 py-2 border-b flex-shrink-0 ${isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
        <FileCode className="w-4 h-4 text-amber-400" />
        <select value={selectedId} onChange={e => handleSelect(e.target.value)}
          className={`px-3 py-1.5 rounded border text-sm outline-none cursor-pointer ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-300'}`}
        >{typingPresets.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select>
        <span className={`text-xs px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'} ${DIFFICULTY_COLORS[preset.difficulty]}`}>{DIFFICULTY_LABELS[preset.difficulty]}</span>

        <div className="w-px h-5 bg-slate-600/30 mx-1" />

        {/* 字体大小 */}
        <div className="flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 opacity-40" />
          <button onClick={() => changeFontSize(-1)} className={`px-1.5 py-0.5 rounded text-xs border hover:bg-opacity-20 ${isDarkMode ? 'border-slate-600 hover:bg-white' : 'border-slate-300 hover:bg-black'}`} title="缩小字体"><Minus className="w-3 h-3" /></button>
          <span className="text-xs min-w-[2rem] text-center font-mono">{fontSize}px</span>
          <button onClick={() => changeFontSize(1)} className={`px-1.5 py-0.5 rounded text-xs border hover:bg-opacity-20 ${isDarkMode ? 'border-slate-600 hover:bg-white' : 'border-slate-300 hover:bg-black'}`} title="放大字体"><Plus className="w-3 h-3" /></button>
        </div>

        <div className="w-px h-5 bg-slate-600/30 mx-1" />

        {/* 统计 */}
        {started && (
          <div className="flex items-center gap-4 text-xs">
            <span className="text-amber-400 font-mono font-bold">{stats.wpm}<span className="opacity-50 font-normal ml-0.5">WPM</span></span>
            <span className="text-emerald-400 font-mono font-bold">{stats.accuracy}%<span className="opacity-50 font-normal ml-0.5">准确</span></span>
            <span className="text-blue-400 font-mono font-bold">{stats.time}s</span>
            <span className="opacity-60">{typed.length}/{code.length}</span>
          </div>
        )}

        {/* 最后按键 */}
        {started && lastKeyPressed && (
          <div className="flex items-center gap-1 ml-1">
            <span className="text-xs opacity-35">按键:</span>
            <kbd className={`px-1.5 py-0.5 rounded text-xs font-mono shadow-sm ${isDarkMode ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border border-emerald-300'}`}>{lastKeyPressed === ' ' ? '␣' : lastKeyPressed}</kbd>
          </div>
        )}

        <div className="flex-1" />

        <Button size="sm" variant="ghost" onClick={handleCopy}><Copy className="w-3.5 h-3.5 mr-1" />{copied ? '已复制' : '复制'}</Button>
        {started && !completed && <Button size="sm" variant="ghost" onClick={handlePause}>{paused ? <Play className="w-3.5 h-3.5 mr-1" /> : <Pause className="w-3.5 h-3.5 mr-1" />}{paused ? '继续' : '暂停'}</Button>}
        <Button size="sm" variant="ghost" onClick={handleReset}><RotateCcw className="w-3.5 h-3.5 mr-1" />重置</Button>
      </div>

      {/* ===== IDE 主编辑区 ===== */}
      <div className="flex-1 flex min-h-0">
        {/* Left: 参考代码 */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-slate-700/30">
          <div className={`flex items-center gap-2 px-4 py-1.5 text-xs border-b flex-shrink-0 ${headerBg}`}>
            <span className="opacity-50">代码参考</span><span className="opacity-30">|</span>
            <span className="opacity-40">main.c</span><span className="opacity-30">|</span><span className="opacity-40">{totalLines} 行</span>
          </div>
          <div className={`flex-1 overflow-auto p-4 font-mono ${isDarkMode ? 'bg-[#0d1117]' : 'bg-[#fafafa]'}`} style={{ fontSize: `${fontSize}px` }}>
            {renderCodePanel()}
          </div>
        </div>

        {/* Right: 输入区域 */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className={`flex items-center gap-2 px-4 py-1.5 text-xs border-b flex-shrink-0 ${headerBg}`}>
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="opacity-50">输入区域</span><span className="opacity-30">|</span><span className="opacity-40">main.c</span>
            {!started && <span className="text-amber-400 ml-2 animate-pulse">点击此处开始输入...</span>}
          </div>

          {paused ? (
            <div className={`flex-1 flex flex-col items-center justify-center gap-3 ${isDarkMode ? 'bg-[#0d1117]' : 'bg-[#fafafa]'}`}>
              <Pause className="w-10 h-10 opacity-30" /><p className="text-sm opacity-50">已暂停 - 点击继续按钮恢复</p>
            </div>
          ) : (
            <div className="flex-1 flex min-h-0">
              <div ref={lineNumRef}
                className={`py-4 pl-3 pr-1 text-right select-none font-mono text-xs leading-[1.7] shrink-0 overflow-hidden border-r ${isDarkMode ? 'bg-[#0d1117] text-slate-600' : 'bg-[#fafafa] text-slate-400 border-slate-200'}`}
                style={{ lineHeight: `${fontSize * 1.7}px` }}
              >{Array.from({ length: Math.max(typedLines.length, 1) }, (_, i) => <div key={i} style={{ height: `${fontSize * 1.7}px` }}>{i + 1}</div>)}</div>
              <textarea ref={inputRef} value={typed}
                onChange={(e) => { handleChange(e); syncScroll(); }} onKeyDown={handleKeyDown} onScroll={syncScroll}
                disabled={completed} autoFocus spellCheck={false}
                className={`flex-1 w-full resize-none py-4 pl-4 pr-4 font-mono outline-none leading-[1.7] ${isDarkMode ? 'bg-[#0d1117] text-white caret-amber-400' : 'bg-[#fafafa] text-slate-800 caret-amber-500'}`}
                style={{ fontSize: `${fontSize}px` }}
                placeholder="" />
            </div>
          )}
        </div>
      </div>

      {/* ===== Status Bar ===== */}
      <div className={`flex items-center justify-between px-4 py-1 text-xs border-t flex-shrink-0 ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center gap-4">
          <span className="opacity-50">{started ? (completed ? '已完成' : paused ? '已暂停' : '输入中') : '就绪'}</span>
          {started && <span className="opacity-40">正确 <span className="text-emerald-400">{typed.split('').filter((c, i) => c === code[i]).length}</span>{' / '}错误 <span className="text-red-400">{typed.split('').filter((c, i) => c !== code[i]).length}</span></span>}
        </div>
        <div className="flex items-center gap-3 opacity-50">
          <span>UTF-8</span><span>C</span><span>行 {typedLines.length}</span>
        </div>
      </div>

      {/* ===== 虚拟键盘面板（可折叠） ===== */}
      <div className={`flex-shrink-0 border-t transition-all duration-300 ease-in-out ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} ${showKbd ? 'max-h-52' : 'max-h-0 overflow-hidden'}`}>
        {/* 折叠按钮 */}
        <div className={`flex items-center justify-center cursor-pointer py-1 ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`} onClick={() => setShowKbd(v => !v)}>
          {showKbd ? <ChevronDown className="w-4 h-4 opacity-30" /> : <ChevronUp className="w-4 h-4 opacity-30" />}
        </div>
        <div className="px-4 pb-3">
          <VirtualKeyboard isDarkMode={isDarkMode} activeKeys={activeKeys} fontSize={fontSize} />
        </div>
      </div>

      {/* 键盘收起时的展开提示 */}
      {!showKbd && (
        <div className={`flex-shrink-0 border-t py-1 text-center cursor-pointer hover:bg-opacity-10 ${isDarkMode ? 'border-slate-700 hover:bg-white' : 'border-slate-200 hover:bg-black'}`} onClick={() => setShowKbd(true)}>
          <span className="text-xs opacity-30 flex items-center justify-center gap-1"><Keyboard className="w-3 h-3" /> 展开虚拟键盘</span>
        </div>
      )}

      {/* ===== 完成弹窗 ===== */}
      {completed && !showRunner && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-10">
          <div className={`rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl ${isDarkMode ? 'bg-slate-800 border border-slate-600' : 'bg-white border border-slate-200'}`}>
            <Check className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-center mb-4">练习完成!</h2>
            <div className="flex justify-center gap-8 mb-6">
              {[{ v: stats.wpm, l: 'WPM', c: 'text-amber-400' }, { v: stats.accuracy, l: '%准确率', c: 'text-emerald-400' }, { v: stats.time, l: '秒用时', c: 'text-blue-400' }].map(x => (
                <div key={x.l} className="text-center">
                  <div className={`text-3xl font-bold ${x.c}`}>{x.v}</div>
                  <div className="text-xs opacity-50 mt-1">{x.l.replace(/[0-9]/g,'')}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={handleReset} variant="outline" className="w-full"><RotateCcw className="w-4 h-4 mr-2" />再来一次</Button>
              <Button onClick={() => { handleCopy(); }} variant="outline" className="w-full"><Copy className="w-4 h-4 mr-2" />{copied ? '已复制代码' : '复制代码'}</Button>
              <Button onClick={() => { setShowRunner(true); setRunResult(null); }} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"><Play className="w-4 h-4 mr-2" />运行代码验证</Button>
            </div>
            <p className="text-xs opacity-40 text-center mt-3">使用 GCC 编译器验证代码是否能正确运行</p>
          </div>
        </div>
      )}

      {/* ===== GCC 运行器弹窗 ===== */}
      {showRunner && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-20">
          <div className={`rounded-2xl p-6 max-w-3xl w-full mx-4 shadow-2xl ${isDarkMode ? 'bg-slate-800 border border-slate-600' : 'bg-white border border-slate-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2"><Terminal className="w-5 h-5 text-emerald-400" /><h2 className="text-lg font-bold">GCC 代码验证</h2></div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleRun} disabled={isRunningGcc} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  {isRunningGcc ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />编译运行中...</> : <><Play className="w-3.5 h-3.5 mr-1.5" />运行</>}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowRunner(false)}><X className="w-4 h-4" /></Button>
              </div>
            </div>
            <div className={`rounded-lg border overflow-hidden mb-3 ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}>
              <div className={`flex items-center justify-between px-3 py-1.5 text-xs ${headerBg}`}><span className="opacity-50">main.c</span><button onClick={handleCopy} className="opacity-50 hover:opacity-100 transition-opacity">{copied ? '已复制' : '复制'}</button></div>
              <pre className={`p-4 font-mono text-xs leading-relaxed overflow-auto max-h-48 whitespace-pre ${isDarkMode ? 'bg-[#0d1117] text-slate-300' : 'bg-[#fafafa] text-slate-700'}`}>{code}</pre>
            </div>
            <div className={`rounded-lg border overflow-hidden ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}>
              <div className={`px-3 py-1.5 text-xs ${headerBg}`}><span className="opacity-50">终端输出</span></div>
              <div className={`p-4 font-mono text-sm min-h-[120px] max-h-[200px] overflow-auto whitespace-pre-wrap ${isDarkMode ? 'bg-[#0a0c10] text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
                {runResult ? (<div>{runResult.smartTips?.length ? runResult.smartTips.map((t,i)=><div key={i} className="text-amber-400 text-xs mb-1"><strong>{t.title}</strong>: {t.hint}</div>):null}<pre className={runResult.success?'text-emerald-400':'text-red-400'}>{runResult.output}</pre></div>)
                  : (<div className="flex flex-col items-center justify-center h-24 opacity-30"><Terminal className="w-8 h-8 mb-2"/><span className="text-xs">点击"运行"编译并执行</span></div>)}
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs opacity-40">{runResult?.success ? '✅ 编译运行成功' : runResult ? '❌ 出错' : '就绪'}</span>
              <div className="flex gap-2"><Button size="sm" variant="outline" onClick={handleReset}><RotateCcw className="w-3.5 h-3.5 mr-1.5" />重新练习</Button><Button size="sm" variant="outline" onClick={() => setShowRunner(false)}>返回</Button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
CodeTypingPractice.displayName = 'CodeTypingPractice';
