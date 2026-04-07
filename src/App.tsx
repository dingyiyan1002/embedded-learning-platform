import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { TrainingView } from './components/TrainingView';
import { StatsView } from './components/StatsView';
import { ReviewView } from './components/ReviewView';
import { BookmarkedView } from './components/BookmarkedView';
import { ProjectsListView } from './components/ProjectsListView';
import { ProjectView } from './components/ProjectView';
import { LabView } from './components/LabView';
import { CodeTypingPractice } from './components/CodeTypingPractice';
import { loadProgress, saveProgress, updateStudyDays, defaultProgress, checkAchievements } from './services/progressApi';
import { chapters } from './data/lessons';
import { ViewType, Progress, UserStats } from './types';

const VALID_VIEWS = new Set<ViewType>(['home', 'training', 'stats', 'review', 'bookmarked', 'projects', 'project', 'lab', 'typing']);

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved !== 'light' : true;
  });
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [view, setView] = useState<ViewType>('home');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [gccConnected, setGccConnected] = useState(false);

  // Theme
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => setIsDarkMode(d => !d), []);

  // GCC heartbeat - use cors mode to get actual status
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/health', { signal: AbortSignal.timeout(3000) });
        setGccConnected(res.ok);
      } catch {
        setGccConnected(false);
      }
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, []);

  // Save progress
  const handleUpdateProgress = useCallback((newProgress: Progress) => {
    const updated = updateStudyDays(newProgress);
    const newAchievements = checkAchievements(updated);
    if (newAchievements.length > 0) {
      updated.achievements = [...updated.achievements, ...newAchievements];
    }
    setProgress(updated);
    saveProgress(updated);
  }, []);

  const handleResetProgress = useCallback(() => {
    const fresh = { ...defaultProgress };
    setProgress(fresh);
    saveProgress(fresh);
  }, []);

  // Stats
  const stats: UserStats = useMemo(() => {
    const totalCompleted = progress.completed.length;
    const totalCorrect = progress.correct.length;
    const totalWrong = progress.wrong.length;
    const accuracy = totalCompleted > 0 ? Math.round((totalCorrect / totalCompleted) * 100) : 0;

    const chapterStats: Record<string, { correct: number; total: number }> = {};
    chapters.forEach(ch => {
      const correctCount = ch.questionIds.filter(id => progress.correct.includes(id)).length;
      chapterStats[ch.id] = { correct: correctCount, total: ch.questionIds.length };
    });

    return {
      totalCompleted,
      totalCorrect,
      totalWrong,
      accuracy,
      totalBookmarked: progress.bookmarked.length,
      studyDays: progress.studyDays.length,
      currentStreak: progress.currentStreak,
      avgDailyQuestions: progress.studyDays.length > 0 ? Math.round(totalCompleted / progress.studyDays.length) : 0,
      chapterStats,
    };
  }, [progress]);

  const handleNavigate = useCallback((v: string) => {
    const valid = v as ViewType;
    if (VALID_VIEWS.has(valid)) {
      setView(valid);
    } else {
      setView('home');
    }
  }, []);

  const handleChapterSelect = useCallback((chapterId: string) => {
    setSelectedChapterId(chapterId);
    setView('training');
  }, []);

  const handleProjectSelect = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
    setView('project');
  }, []);

  const currentView = useMemo(() => view, [view]);

  const viewElement = useMemo(() => {
    switch (currentView) {
      case 'home':
        return <HomeView isDarkMode={isDarkMode} stats={stats} onNavigate={handleNavigate} onChapterSelect={handleChapterSelect} />;
      case 'training':
        return <TrainingView isDarkMode={isDarkMode} chapterId={selectedChapterId} progress={progress} onUpdateProgress={handleUpdateProgress} onNavigate={handleNavigate} />;
      case 'stats':
        return <StatsView isDarkMode={isDarkMode} stats={stats} progress={progress} onResetProgress={handleResetProgress} />;
      case 'review':
        return <ReviewView isDarkMode={isDarkMode} progress={progress} onUpdateProgress={handleUpdateProgress} />;
      case 'bookmarked':
        return <BookmarkedView isDarkMode={isDarkMode} progress={progress} onUpdateProgress={handleUpdateProgress} />;
      case 'projects':
        return <ProjectsListView isDarkMode={isDarkMode} onSelectProject={handleProjectSelect} />;
      case 'project':
        return <ProjectView isDarkMode={isDarkMode} projectId={selectedProjectId} onNavigate={handleNavigate} />;
      case 'lab':
        return <LabView isDarkMode={isDarkMode} />;
      case 'typing':
        return <CodeTypingPractice isDarkMode={isDarkMode} />;
      default:
        return <HomeView isDarkMode={isDarkMode} stats={stats} onNavigate={handleNavigate} onChapterSelect={handleChapterSelect} />;
    }
  }, [currentView, isDarkMode, stats, selectedChapterId, progress, selectedProjectId, handleNavigate, handleChapterSelect, handleProjectSelect, handleUpdateProgress, handleResetProgress]);

  return (
    <div className="min-h-screen transition-colors duration-300">
      <Header
        isDarkMode={isDarkMode}
        currentView={view}
        onNavigate={handleNavigate}
        onToggleTheme={toggleTheme}
        accuracy={stats.accuracy}
        gccConnected={gccConnected}
      />
      <main className="pt-16 min-h-screen">
        {viewElement}
      </main>
    </div>
  );
}

export default App;
