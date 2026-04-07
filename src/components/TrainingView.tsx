import React, { useState, useEffect, useCallback, memo } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { chapters, questions } from '@/data/lessons';
import { Progress as ProgressType, Lesson } from '@/types';
import { QuestionView } from './QuestionView';

interface TrainingViewProps {
  isDarkMode: boolean;
  chapterId: string;
  progress: ProgressType;
  onUpdateProgress: (progress: ProgressType) => void;
  onNavigate: (view: string) => void;
}

export const TrainingView: React.FC<TrainingViewProps> = memo(({
  isDarkMode, chapterId, progress, onUpdateProgress, onNavigate,
}) => {
  const chapter = chapters.find(c => c.id === chapterId);
  const chapterQuestions = questions.filter(q => q.chapterId === chapterId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLesson, setShowLesson] = useState(true);
  const [lessonPage, setLessonPage] = useState(0);
  const [completed, setCompleted] = useState(false);

  const currentQuestion = chapterQuestions[currentIndex];
  const totalQuestions = chapterQuestions.length;

  useEffect(() => {
    setShowLesson(true);
    setLessonPage(0);
    setCurrentIndex(0);
    setCompleted(false);
  }, [chapterId]);

  const handleAnswer = useCallback((questionId: string, isCorrect: boolean) => {
    const updated = { ...progress };
    if (!updated.completed.includes(questionId)) updated.completed = [...updated.completed, questionId];
    if (!updated.attempts[questionId]) updated.attempts = { ...updated.attempts, [questionId]: 0 };
    updated.attempts = { ...updated.attempts, [questionId]: (updated.attempts[questionId] || 0) + 1 };

    if (isCorrect) {
      if (!updated.correct.includes(questionId)) updated.correct = [...updated.correct, questionId];
      updated.wrong = updated.wrong.filter(id => id !== questionId);
    } else {
      if (!updated.wrong.includes(questionId)) updated.wrong = [...updated.wrong, questionId];
    }

    onUpdateProgress(updated);

    if (isCorrect && currentIndex < totalQuestions - 1) {
      setTimeout(() => setCurrentIndex(i => i + 1), 1500);
    } else if (isCorrect && currentIndex === totalQuestions - 1) {
      setCompleted(true);
    }
  }, [progress, currentIndex, totalQuestions, onUpdateProgress]);

  const toggleBookmark = useCallback((questionId: string) => {
    const updated = { ...progress };
    if (updated.bookmarked.includes(questionId)) {
      updated.bookmarked = updated.bookmarked.filter(id => id !== questionId);
    } else {
      updated.bookmarked = [...updated.bookmarked, questionId];
    }
    onUpdateProgress(updated);
  }, [progress, onUpdateProgress]);

  if (!chapter) {
    return <div className="flex items-center justify-center h-full"><p>章节未找到</p></div>;
  }

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Trophy className="w-20 h-20 text-amber-400" />
        <h2 className="text-2xl font-bold">章节完成!</h2>
        <p className="opacity-60">你已完成 {chapter.name} 的所有练习</p>
        <Button onClick={() => onNavigate('home')}>返回首页</Button>
      </div>
    );
  }

  if (showLesson && chapter.lessons && chapter.lessons.length > 0) {
    const lesson: Lesson = chapter.lessons[lessonPage];
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="glass rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold">{lesson.title}</h2>
          </div>
          <div className="prose prose-sm max-w-none opacity-80 whitespace-pre-wrap mb-4">
            {lesson.content}
          </div>
          {lesson.keyPoints && (
            <div className="bg-amber-500/10 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-amber-400 mb-2">关键要点</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                {lesson.keyPoints.map((point, i) => <li key={i}>{point}</li>)}
              </ul>
            </div>
          )}
        </div>
        <div className="flex justify-between">
          <Button
            variant="outline" onClick={() => setLessonPage(p => Math.max(0, p - 1))}
            disabled={lessonPage === 0}
          >
            <ChevronLeft className="w-4 h-4" /> 上一页
          </Button>
          {lessonPage < chapter.lessons.length - 1 ? (
            <Button onClick={() => setLessonPage(p => p + 1)}>
              下一页 <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={() => setShowLesson(false)} className="bg-amber-500 hover:bg-amber-600">
              开始练习
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div className="flex items-center justify-center h-full"><p>暂无题目</p></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      <div className="flex items-center gap-4 mb-4">
        <span className="text-sm opacity-50">{chapter.name}</span>
        <Progress value={((currentIndex + 1) / totalQuestions) * 100} className="flex-1" />
        <span className="text-sm opacity-50">{currentIndex + 1}/{totalQuestions}</span>
      </div>
      <div className="flex justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => setCurrentIndex(i => Math.max(0, i - 1))} disabled={currentIndex === 0}>
          <ChevronLeft className="w-4 h-4" /> 上一题
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setCurrentIndex(i => Math.min(totalQuestions - 1, i + 1))} disabled={currentIndex === totalQuestions - 1}>
          下一题 <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <QuestionView
        question={currentQuestion}
        isDarkMode={isDarkMode}
        progress={progress}
        onAnswer={(isCorrect) => handleAnswer(currentQuestion.id, isCorrect)}
        onToggleBookmark={() => toggleBookmark(currentQuestion.id)}
      />
    </div>
  );
});
TrainingView.displayName = 'TrainingView';
