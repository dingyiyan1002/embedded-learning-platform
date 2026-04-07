export interface Question {
  id: string;
  chapterId: string;
  type: 'fill' | 'output' | 'debug' | 'order' | 'multi-fill' | 'choice' | 'multi-choice' | 'trace' | 'concept' | 'code-complete' | 'reading';
  code?: string;
  question?: string;
  answer?: string | string[];
  hint?: string;
  explanation?: string;
  difficulty?: 1 | 2 | 3;
  caseSensitive?: boolean;

  // debug
  errorLine?: number;
  bugFix?: string;

  // order
  shuffledLines?: string[];
  correctOrder?: number[];
  correctOutput?: string;

  // choice
  options?: string[];
  multiCorrect?: boolean;

  // trace
  traceQuestion?: string;
  correctTrace?: string;

  // concept / code-complete
  conceptText?: string;
  completionPrompt?: string;
  correctCode?: string;

  // reading
  readingPassage?: string;

  // deep analysis
  lineAnalysis?: CodeLineAnalysis[];
  memoryViz?: MemoryVisualization;
  knowledgePoints?: string[];
  commonMistakes?: string[];
  relatedConcepts?: string[];

  // visualization
  visualization?: { type: 'html'; content: string };
}

export interface CodeLineAnalysis {
  line: number;
  explanation: string;
  memoryChanges?: string;
}

export interface MemoryVisualization {
  steps: StepState[];
}

export interface StepState {
  line: number;
  description: string;
  variables: Record<string, VariableState>;
}

export interface VariableState {
  name: string;
  value: string;
  type: string;
  address?: string;
}

export interface Chapter {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'exam' | 'test' | 'practice';
  questionIds: string[];
  lessons?: Lesson[];
}

export interface Lesson {
  title: string;
  content: string;
  keyPoints?: string[];
}

export interface Progress {
  completed: string[];
  correct: string[];
  wrong: string[];
  attempts: Record<string, number>;
  bookmarked: string[];
  analyzed: string[];
  startDate?: string;
  lastStudyDate?: string;
  studyDays: number[];
  currentStreak: number;
  achievements: string[];
}

export interface UserStats {
  totalCompleted: number;
  totalCorrect: number;
  totalWrong: number;
  accuracy: number;
  totalBookmarked: number;
  studyDays: number;
  currentStreak: number;
  avgDailyQuestions: number;
  chapterStats: Record<string, { correct: number; total: number }>;
}

export interface Project {
  id: string;
  name: string;
  difficulty: string;
  description: string;
  tags: string[];
  fragments: ProjectFragment[];
}

export interface ProjectFragment {
  code: string;
  explanation: string;
  tags?: string[];
}

export interface AIProvider {
  name: string;
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
  enabled: boolean;
}

export interface AIConfig {
  activeProvider: string;
  providers: AIProvider[];
  systemPrompt: string;
}

export interface CodePreset {
  id: string;
  name: string;
  difficulty: 'beginner' | 'basic' | 'intermediate' | 'advanced';
  code: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
}

export type ViewType = 'home' | 'training' | 'stats' | 'review' | 'bookmarked' | 'projects' | 'project' | 'lab' | 'typing';
