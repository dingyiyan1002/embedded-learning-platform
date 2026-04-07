import React, { memo } from 'react';
import { Trophy, Flame, Calendar, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { chapters } from '@/data/lessons';
import { UserStats, Progress as ProgressType } from '@/types';
import { achievements } from '@/data/lessons';

interface StatsViewProps {
  isDarkMode: boolean;
  stats: UserStats;
  progress: ProgressType;
  onResetProgress: () => void;
}

export const StatsView: React.FC<StatsViewProps> = memo(({ isDarkMode, stats, progress, onResetProgress }) => {
  void isDarkMode;
  const handleReset = () => {
    if (confirm('确定要重置所有进度吗？此操作不可撤销！')) {
      onResetProgress();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">学习统计</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="glass"><CardContent className="p-4 text-center">
          <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-400" />
          <div className="text-2xl font-bold">{stats.studyDays}</div>
          <div className="text-xs opacity-50">学习天数</div>
        </CardContent></Card>
        <Card className="glass"><CardContent className="p-4 text-center">
          <Flame className="w-6 h-6 mx-auto mb-2 text-orange-400" />
          <div className="text-2xl font-bold">{stats.currentStreak}</div>
          <div className="text-xs opacity-50">连续天数</div>
        </CardContent></Card>
        <Card className="glass"><CardContent className="p-4 text-center">
          <Target className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
          <div className="text-2xl font-bold">{stats.accuracy}%</div>
          <div className="text-xs opacity-50">正确率</div>
        </CardContent></Card>
        <Card className="glass"><CardContent className="p-4 text-center">
          <Trophy className="w-6 h-6 mx-auto mb-2 text-amber-400" />
          <div className="text-2xl font-bold">{stats.avgDailyQuestions}</div>
          <div className="text-xs opacity-50">日均题数</div>
        </CardContent></Card>
      </div>

      <div className="glass rounded-2xl p-5 mb-8">
        <h2 className="text-lg font-bold mb-4">总体进度</h2>
        <div className="grid grid-cols-3 gap-4 text-center mb-4">
          <div><div className="text-3xl font-bold text-blue-400">{stats.totalCompleted}</div><div className="text-xs opacity-50">已完成</div></div>
          <div><div className="text-3xl font-bold text-emerald-400">{stats.totalCorrect}</div><div className="text-xs opacity-50">答对</div></div>
          <div><div className="text-3xl font-bold text-red-400">{stats.totalWrong}</div><div className="text-xs opacity-50">答错</div></div>
        </div>
        <Progress value={stats.accuracy} className="h-3" />
      </div>

      <div className="glass rounded-2xl p-5 mb-8">
        <h2 className="text-lg font-bold mb-4">章节详情</h2>
        <div className="space-y-3">
          {chapters.map(ch => {
            const cs = stats.chapterStats[ch.id] || { correct: 0, total: ch.questionIds.length };
            const pct = cs.total > 0 ? Math.round((cs.correct / cs.total) * 100) : 0;
            return (
              <div key={ch.id} className="flex items-center gap-3">
                <span className="text-sm w-24 truncate">{ch.name}</span>
                <Progress value={pct} className="flex-1" />
                <span className="text-xs opacity-50 w-16 text-right">{cs.correct}/{cs.total} ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass rounded-2xl p-5 mb-8">
        <h2 className="text-lg font-bold mb-4">成就</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {achievements.map(a => {
            const unlocked = progress.achievements.includes(a.id);
            return (
              <Card key={a.id} className={`${unlocked ? 'glass' : 'opacity-40'}`}>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl mb-1">{a.icon}</div>
                  <div className="text-xs font-semibold">{a.name}</div>
                  <div className="text-xs opacity-50">{a.description}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="text-center">
        <Button variant="destructive" onClick={handleReset}>重置所有进度</Button>
      </div>
    </div>
  );
});
StatsView.displayName = 'StatsView';
