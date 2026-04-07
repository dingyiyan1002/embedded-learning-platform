import { Progress } from '@/types';

const STORAGE_KEY = 'embedded-learning-progress';

export const defaultProgress: Progress = {
  completed: [],
  correct: [],
  wrong: [],
  attempts: {},
  bookmarked: [],
  analyzed: [],
  startDate: new Date().toISOString(),
  lastStudyDate: new Date().toISOString(),
  studyDays: [],
  currentStreak: 0,
  achievements: [],
};

export function loadProgress(): Progress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultProgress, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load progress:', e);
  }
  return { ...defaultProgress };
}

export function saveProgress(progress: Progress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
}

export function updateStudyDays(progress: Progress): Progress {
  const today = new Date().toISOString().split('T')[0];
  const updated = { ...progress };

  if (updated.lastStudyDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (updated.lastStudyDate === yesterdayStr) {
      updated.currentStreak += 1;
    } else {
      updated.currentStreak = 1;
    }

    if (!updated.studyDays.includes(today)) {
      updated.studyDays = [...updated.studyDays, today];
    }

    updated.lastStudyDate = today;
    if (!updated.startDate) {
      updated.startDate = today;
    }
  }

  return updated;
}

export function checkAchievements(progress: Progress): string[] {
  const newAchievements: string[] = [];
  const totalCompleted = progress.completed.length;
  const totalCorrect = progress.correct.length;
  const accuracy = totalCompleted > 0 ? Math.round((totalCorrect / totalCompleted) * 100) : 0;
  const conditions: Record<string, boolean> = {
    'first-answer': totalCompleted >= 1,
    'total-20': totalCompleted >= 20,
    'total-50': totalCompleted >= 50,
    'accuracy-80': accuracy >= 80,
    'bookmark-5': progress.bookmarked.length >= 5,
    'study-7': progress.studyDays.length >= 7,
  };

  for (const [id, met] of Object.entries(conditions)) {
    if (met && !progress.achievements.includes(id)) {
      newAchievements.push(id);
    }
  }

  return newAchievements;
}
