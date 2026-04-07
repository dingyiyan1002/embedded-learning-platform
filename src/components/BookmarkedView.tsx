import React, { useState, useMemo, memo } from 'react';
import { Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QuestionView } from './QuestionView';
import { questions } from '@/data/lessons';
import type { Progress as ProgressData } from '@/types';

interface BookmarkedViewProps {
  isDarkMode: boolean;
  progress: ProgressData;
  onUpdateProgress: (progress: ProgressData) => void;
}

export const BookmarkedView: React.FC<BookmarkedViewProps> = memo(({ isDarkMode, progress, onUpdateProgress }) => {
  const bookmarkedQuestions = useMemo(() => questions.filter(q => progress.bookmarked.includes(q.id)), [progress.bookmarked]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const current = bookmarkedQuestions[currentIndex];

  const handleAnswer = (_isCorrect: boolean) => { /* No-op for bookmarked view */ };

  const toggleBookmark = (questionId: string) => {
    const updated = { ...progress };
    updated.bookmarked = updated.bookmarked.filter(id => id !== questionId);
    onUpdateProgress(updated);
    // 同步调整索引：删完后列表会缩短1项
    const newTotal = bookmarkedQuestions.length - 1;
    if (currentIndex >= newTotal && currentIndex > 0) {
      setCurrentIndex(newTotal);
    }
  };

  if (bookmarkedQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Bookmark className="w-16 h-16 text-purple-400 opacity-40" />
        <h2 className="text-xl font-bold">暂无收藏</h2>
        <p className="opacity-60">答题时点击书签图标即可收藏</p>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      <div className="flex items-center gap-4 mb-4">
        <span className="text-sm opacity-50">收藏夹 ({currentIndex + 1}/{bookmarkedQuestions.length})</span>
        <Progress value={((currentIndex + 1) / bookmarkedQuestions.length) * 100} className="flex-1" />
      </div>
      <div className="flex justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => setCurrentIndex(i => Math.max(0, i - 1))} disabled={currentIndex === 0}>
          <ChevronLeft className="w-4 h-4" /> 上一题
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setCurrentIndex(i => Math.min(bookmarkedQuestions.length - 1, i + 1))} disabled={currentIndex === bookmarkedQuestions.length - 1}>
          下一题 <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <QuestionView
        question={current}
        isDarkMode={isDarkMode}
        progress={progress}
        onAnswer={handleAnswer}
        onToggleBookmark={() => toggleBookmark(current.id)}
      />
    </div>
  );
});
BookmarkedView.displayName = 'BookmarkedView';
