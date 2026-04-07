import React, { useState, useMemo, memo } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { QuestionView } from './QuestionView';
import { questions } from '@/data/lessons';
import { Progress } from '@/types';

interface ReviewViewProps {
  isDarkMode: boolean;
  progress: Progress;
  onUpdateProgress: (progress: Progress) => void;
}

export const ReviewView: React.FC<ReviewViewProps> = memo(({ isDarkMode, progress, onUpdateProgress }) => {
  const wrongQuestions = useMemo(() => questions.filter(q => progress.wrong.includes(q.id)), [progress.wrong]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const current = wrongQuestions[currentIndex];

  const handleAnswer = (isCorrect: boolean) => {
    if (!isCorrect || !current) return;
    const updated = { ...progress };
    updated.wrong = updated.wrong.filter(id => id !== current.id);
    if (!updated.correct.includes(current.id)) updated.correct = [...updated.correct, current.id];
    onUpdateProgress(updated);

    // 计算移除后的新列表长度（-1）
    const newTotal = wrongQuestions.length - 1;
    if (currentIndex < newTotal) {
      setTimeout(() => setCurrentIndex(i => i + 1), 1500);
    }
  };

  const toggleBookmark = (questionId: string) => {
    const updated = { ...progress };
    if (updated.bookmarked.includes(questionId)) {
      updated.bookmarked = updated.bookmarked.filter(id => id !== questionId);
    } else {
      updated.bookmarked = [...updated.bookmarked, questionId];
    }
    onUpdateProgress(updated);
  };

  if (wrongQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <CheckCircle className="w-16 h-16 text-emerald-400" />
        <h2 className="text-xl font-bold">没有错题</h2>
        <p className="opacity-60">继续保持！</p>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">错题复习 ({currentIndex + 1}/{wrongQuestions.length})</h2>
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-400" />
          <span className="text-sm opacity-50">{wrongQuestions.length} 题待复习</span>
        </div>
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
ReviewView.displayName = 'ReviewView';
