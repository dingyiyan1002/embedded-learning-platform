import React, { useState, useCallback, useMemo, useRef, memo } from 'react';
import { Check, X, Bookmark, BookmarkCheck, Lightbulb, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CodeBlock } from './SyntaxHighlighter';
import { Question, Progress } from '@/types';
import { deriveVocabularyFromText } from '@/data/vocabulary';

interface QuestionViewProps {
  question: Question;
  isDarkMode: boolean;
  progress: Progress;
  onAnswer: (isCorrect: boolean) => void;
  onToggleBookmark: () => void;
}

export const QuestionView: React.FC<QuestionViewProps> = memo(({
  question, isDarkMode, progress, onAnswer, onToggleBookmark,
}) => {
  void isDarkMode;
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<number[]>([]);
  const [selectedChoice, setSelectedChoice] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isBookmarked = progress.bookmarked.includes(question.id);

  // Debug题：从 errorLine 推导 answer（原始数据未设 answer 字段）
  const effectiveAnswer = useMemo(() => {
    if (question.type === 'debug' && question.errorLine != null && !question.answer) {
      return String(question.errorLine);
    }
    return question.answer;
  }, [question.type, question.errorLine, question.answer]);

  const vocabulary = useMemo(() => {
    const text = [question.code, question.question].filter(Boolean).join(' ');
    return deriveVocabularyFromText(text);
  }, [question.code, question.question]);

  const normalizeInput = (s: string) => s.trim()
    .replace(/，/g, ',').replace(/。/g, '.').replace(/（/g, '(')
    .replace(/）/g, ')').replace(/【/g, '[').replace(/】/g, ']')
    .replace(/｛/g, '{').replace(/｝/g, '}').replace(/\r\n/g, '\n');

  const checkAnswerSingle = useCallback((userAns: string, correctVal?: string | string[]) => {
    const correct = correctVal ?? effectiveAnswer;
    if (correct === undefined || correct === null) return false;
    if (Array.isArray(correct)) {
      return correct.some(a => question.caseSensitive === false
        ? normalizeInput(userAns).toLowerCase() === normalizeInput(a).toLowerCase()
        : normalizeInput(userAns) === normalizeInput(a)
      );
    }
    return question.caseSensitive === false
      ? normalizeInput(userAns).toLowerCase() === normalizeInput(correct).toLowerCase()
      : normalizeInput(userAns) === normalizeInput(correct);
  }, [effectiveAnswer, question.caseSensitive]);

  const checkAnswer = useCallback((userAns: string) => checkAnswerSingle(userAns), [checkAnswerSingle]);

  const handleSubmit = useCallback(() => {
    let correct = false;
    if (question.type === 'fill' || question.type === 'multi-fill') {
      const userAnswers = question.type === 'multi-fill' ? answers : [answer];
      const correctList = Array.isArray(effectiveAnswer) ? effectiveAnswer : [effectiveAnswer];
      correct = userAnswers.every((a, i) => checkAnswerSingle(a, correctList[i]));
    } else if (question.type === 'output' || question.type === 'trace' || question.type === 'debug' || question.type === 'concept' || question.type === 'code-complete' || question.type === 'reading') {
      correct = checkAnswer(answer);
    } else if (question.type === 'order') {
      correct = question.correctOrder ? JSON.stringify(selectedOrder) === JSON.stringify(question.correctOrder) : false;
    } else if (question.type === 'choice' || question.type === 'multi-choice') {
      const correctAns = Array.isArray(effectiveAnswer) ? effectiveAnswer : [effectiveAnswer];
      correct = correctAns.includes(selectedChoice);
    } else {
      correct = checkAnswer(answer);
    }

    setIsCorrect(correct);
    setShowResult(true);
    onAnswer(correct);
  }, [question, answer, answers, selectedOrder, selectedChoice, effectiveAnswer, checkAnswer, checkAnswerSingle, onAnswer]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showResult) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit, showResult]);

  const typeBadge = useMemo(() => {
    const badges: Record<string, { label: string; color: string }> = {
      'fill': { label: '代码填空', color: 'bg-blue-500/20 text-blue-400' },
      'multi-fill': { label: '代码填空', color: 'bg-blue-500/20 text-blue-400' },
      'output': { label: '输出预测', color: 'bg-emerald-500/20 text-emerald-400' },
      'debug': { label: 'Debug找错', color: 'bg-red-500/20 text-red-400' },
      'order': { label: '代码排序', color: 'bg-amber-500/20 text-amber-400' },
      'choice': { label: '选择题', color: 'bg-purple-500/20 text-purple-400' },
      'multi-choice': { label: '选择题', color: 'bg-purple-500/20 text-purple-400' },
      'trace': { label: '代码追踪', color: 'bg-cyan-500/20 text-cyan-400' },
      'concept': { label: '概念理解', color: 'bg-violet-500/20 text-violet-400' },
      'code-complete': { label: '代码补全', color: 'bg-teal-500/20 text-teal-400' },
      'reading': { label: '阅读理解', color: 'bg-orange-500/20 text-orange-400' },
    };
    return badges[question.type] || { label: '其他', color: 'bg-gray-500/20 text-gray-400' };
  }, [question.type]);

  const renderInputArea = () => {
    if (question.type === 'fill' || question.type === 'multi-fill') {
      if (question.type === 'multi-fill') {
        return (
          <div className="flex flex-wrap gap-2 mb-4">
            {(Array.isArray(question.answer) ? question.answer : ['']).map((_, i) => (
              <input
                key={i}
                type="text"
                value={answers[i] || ''}
                onChange={e => { const n = [...answers]; n[i] = e.target.value; setAnswers(n); }}
                onKeyDown={e => { if (e.key === 'Tab') { e.preventDefault(); document.getElementById(`fill-${i + 1}`)?.focus(); } }}
                disabled={showResult}
                className={`px-3 py-2 rounded-lg border text-sm min-w-[60px] outline-none transition-colors ${showResult
                  ? checkAnswer(answers[i]) ? 'border-emerald-500 bg-emerald-500/10' : 'border-red-500 bg-red-500/10'
                  : 'border-white/20 focus:border-amber-400'}`}
                placeholder={`空${i + 1}`}
                id={`fill-${i}`}
              />
            ))}
          </div>
        );
      }
      return (
        <input
          type="text"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={showResult}
          className={`w-full px-4 py-3 rounded-lg border text-sm outline-none transition-colors ${showResult
            ? isCorrect ? 'border-emerald-500 bg-emerald-500/10' : 'border-red-500 bg-red-500/10'
            : 'border-white/20 focus:border-amber-400'}`}
          placeholder="输入答案..."
        />
      );
    }

    if (question.type === 'output' || question.type === 'trace') {
      return (
        <textarea
          ref={textareaRef}
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          onKeyDown={e => { if (e.key === 'Tab') { e.preventDefault(); const t = e.target as HTMLTextAreaElement; const s = t.selectionStart; setAnswer(answer.substring(0, s) + '\t' + answer.substring(t.selectionEnd)); setTimeout(() => t.selectionStart = t.selectionEnd = s + 1, 0); } }}
          disabled={showResult}
          rows={4}
          className={`w-full px-4 py-3 rounded-lg border text-sm font-mono outline-none resize-y transition-colors ${showResult
            ? isCorrect ? 'border-emerald-500 bg-emerald-500/10' : 'border-red-500 bg-red-500/10'
            : 'border-white/20 focus:border-amber-400'}`}
          placeholder="输入预期输出..."
        />
      );
    }

    if (question.type === 'debug') {
      return (
        <div className="flex gap-2">
          <input
            type="number"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={showResult}
            className={`px-4 py-3 rounded-lg border text-sm outline-none w-32 transition-colors ${showResult
              ? isCorrect ? 'border-emerald-500 bg-emerald-500/10' : 'border-red-500 bg-red-500/10'
              : 'border-white/20 focus:border-amber-400'}`}
            placeholder="行号"
          />
        </div>
      );
    }

    if (question.type === 'order') {
      return (
        <div className="space-y-3">
          <div className="order-result-area rounded-lg p-3 min-h-[80px]">
            <div className="text-xs opacity-50 mb-2">组装区</div>
            {selectedOrder.map((idx, i) => (
              <div
                key={i}
                className={`order-line-btn px-3 py-1.5 rounded text-sm mb-1 flex justify-between ${showResult
                  ? question.correctOrder?.[i] === idx ? 'border-emerald-500' : 'border-red-500'
                  : ''}`}
              >
                <span>{String(i + 1).padStart(2, ' ')} {question.shuffledLines?.[idx]}</span>
                {showResult && question.correctOrder?.[i] !== idx && <X className="w-3 h-3 text-red-400" />}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setSelectedOrder(o => o.slice(0, -1))} disabled={selectedOrder.length === 0 || showResult}>撤销</Button>
            <Button size="sm" variant="outline" onClick={() => setSelectedOrder([])} disabled={showResult}>重置</Button>
          </div>
          <div className="text-xs opacity-50 mb-1">可选代码行</div>
          {question.shuffledLines?.map((line, i) => !selectedOrder.includes(i) && (
            <button
              key={i}
              onClick={() => setSelectedOrder(o => [...o, i])}
              disabled={showResult}
              className="order-line-btn w-full px-3 py-1.5 rounded text-sm text-left mb-1 hover:border-amber-500/50 transition-colors"
            >
              {line}
            </button>
          ))}
        </div>
      );
    }

    if (question.type === 'choice' || question.type === 'multi-choice') {
      const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {question.options?.map((opt, i) => {
            const correctAns = Array.isArray(question.answer) ? question.answer : [question.answer];
            let btnClass = 'border-white/20 hover:border-amber-400';
            if (showResult) {
              if (correctAns.includes(opt)) btnClass = 'border-emerald-500 bg-emerald-500/10';
              else if (selectedChoice === opt) btnClass = 'border-red-500 bg-red-500/10';
            } else if (selectedChoice === opt) {
              btnClass = 'border-amber-400 bg-amber-500/10';
            }
            return (
              <button
                key={i}
                onClick={() => {
                  if (showResult) return;
                  setSelectedChoice(opt);
                  // 选择题：点击即提交
                  setTimeout(() => handleSubmit(), 0);
                }}
                disabled={showResult}
                className={`p-3 rounded-lg border text-sm text-left transition-all ${btnClass}`}
              >
                <span className="font-semibold mr-2 opacity-60">{labels[i]}.</span>
                {opt}
              </button>
            );
          })}
        </div>
      );
    }

    // Default text input for trace, concept, code-complete, reading
    return (
      <textarea
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={showResult}
        rows={3}
        className={`w-full px-4 py-3 rounded-lg border text-sm outline-none resize-y transition-colors ${showResult
          ? isCorrect ? 'border-emerald-500 bg-emerald-500/10' : 'border-red-500 bg-red-500/10'
          : 'border-white/20 focus:border-amber-400'}`}
        placeholder="输入答案..."
      />
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Main area */}
      <div className="lg:col-span-3 space-y-4">
        <div className="glass rounded-2xl p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded-full ${typeBadge.color}`}>{typeBadge.label}</span>
              {question.difficulty && (
                <span className="text-xs text-amber-400">
                  {'★'.repeat(question.difficulty)}{'☆'.repeat(3 - question.difficulty)}
                </span>
              )}
            </div>
            <button onClick={onToggleBookmark} className="p-1.5 rounded hover:bg-white/10 transition-colors">
              {isBookmarked ? <BookmarkCheck className="w-5 h-5 text-amber-400" /> : <Bookmark className="w-5 h-5 opacity-50" />}
            </button>
          </div>

          {/* Question text */}
          {question.question && (
            <p className="mb-4 opacity-80">{question.question}</p>
          )}

          {/* Code block */}
          {question.code && (
            <div className="mb-4">
              {question.type === 'fill' || question.type === 'multi-fill' ? (
                <div className="code-wrapper rounded-xl overflow-hidden">
                  <div className="code-block p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                    {question.code.split('___').map((part, i, arr) => {
                      if (i === arr.length - 1) return <span key={i}>{part}</span>;
                      const placeholders = ['①', '②', '③', '④', '⑤'];
                      return (
                        <React.Fragment key={i}>
                          <span>{part}</span>
                          <span className="inline-block px-2 py-0.5 mx-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs align-middle">
                            {placeholders[i] || i + 1}
                          </span>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <CodeBlock
                  code={question.code}
                  highlightLine={showResult && question.type === 'debug' ? question.errorLine : undefined}
                  showLineNumbers={question.type === 'debug'}
                />
              )}
            </div>
          )}

          {/* Input area */}
          {renderInputArea()}

          {/* Submit button */}
          {!showResult && (question.type !== 'choice' && question.type !== 'multi-choice') && (
            <Button onClick={handleSubmit} className="w-full mt-4 bg-amber-500 hover:bg-amber-600">提交答案</Button>
          )}
        </div>

        {/* Result */}
        {showResult && (
          <div className={`glass rounded-2xl p-5 ${isCorrect ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
            <div className="flex items-center gap-3 mb-3">
              {isCorrect ? (
                <>
                  <Check className="w-6 h-6 text-emerald-400" />
                  <span className="font-semibold text-emerald-400">完全正确!</span>
                </>
              ) : (
                <>
                  <X className="w-6 h-6 text-red-400" />
                  <span className="font-semibold text-red-400">还需要再想想</span>
                </>
              )}
            </div>
            {!isCorrect && effectiveAnswer && (
              <div className="text-sm opacity-70 mb-3">
                <span className="font-medium">正确答案: </span>
                <code className="bg-amber-500/10 px-2 py-0.5 rounded text-amber-300">
                  {Array.isArray(effectiveAnswer) ? effectiveAnswer.join(', ') : effectiveAnswer}
                </code>
              </div>
            )}
            {question.explanation && (
              <div className="text-sm opacity-60 bg-white/5 rounded-lg p-3 mt-3">
                {question.explanation}
              </div>
            )}
            {question.bugFix && question.type === 'debug' && (
              <div className="mt-3">
                <div className="text-xs opacity-50 mb-1">修复方案:</div>
                <CodeBlock code={question.bugFix} />
              </div>
            )}
          </div>
        )}

        {/* Hint */}
        {!showResult && (question.hint) && (
          <div className="glass rounded-xl p-4">
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300"
            >
              <Lightbulb className="w-4 h-4" />
              <span>显示提示</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showHint ? 'rotate-180' : ''}`} />
            </button>
            {showHint && <p className="mt-2 text-sm opacity-60">{question.hint}</p>}
          </div>
        )}

        {/* Deep Analysis */}
        {showResult && (question.knowledgePoints?.length || question.commonMistakes?.length) && (
          <div className="glass rounded-xl p-4">
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="flex items-center gap-2 text-sm opacity-70 hover:opacity-100"
            >
              <span>深度分析</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showAnalysis ? 'rotate-180' : ''}`} />
            </button>
            {showAnalysis && (
              <div className="mt-3 space-y-3">
                {question.knowledgePoints && (
                  <div className="flex flex-wrap gap-2">
                    {question.knowledgePoints.map((kp, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">{kp}</span>
                    ))}
                  </div>
                )}
                {question.commonMistakes && (
                  <div>
                    <div className="text-xs opacity-50 mb-1">常见错误:</div>
                    <ul className="list-disc list-inside text-sm space-y-1 opacity-60">
                      {question.commonMistakes.map((m, i) => <li key={i}>{m}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <div className="glass rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-2 text-amber-400">题型说明</h3>
          <p className="text-xs opacity-50">{typeBadge.label}</p>
        </div>
        {vocabulary.length > 0 && (
          <div className="glass rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-2 text-amber-400">词汇表</h3>
            <div className="space-y-2">
              {vocabulary.slice(0, 8).map((v, i) => (
                <div key={i}>
                  <span className="text-xs font-mono text-blue-400">{v.word}</span>
                  <p className="text-xs opacity-40">{v.definition}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
QuestionView.displayName = 'QuestionView';
