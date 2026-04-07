import React, { memo, useMemo } from 'react';
import { BookOpen, ArrowUpDown, Keyboard, BarChart3, Bookmark, XCircle, Target, Zap, Bug, ListOrdered } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { chapters } from '@/data/lessons';
import { ViewType, UserStats } from '@/types';

interface HomeViewProps {
  isDarkMode: boolean;
  stats: UserStats;
  onNavigate: (view: ViewType) => void;
  onChapterSelect: (chapterId: string) => void;
}

const modeIcons: Record<string, React.ReactNode> = {
  FileCode: <BookOpen className="w-6 h-6" />, Repeat: <ArrowUpDown className="w-6 h-6" />,
  LayoutGrid: <ListOrdered className="w-6 h-6" />, ArrowRight: <Target className="w-6 h-6" />,
  Box: <Zap className="w-6 h-6" />, Layers: <BookOpen className="w-6 h-6" />,
  Type: <Keyboard className="w-6 h-6" />, Binary: <BarChart3 className="w-6 h-6" />,
};

export const HomeView: React.FC<HomeViewProps> = memo(({ isDarkMode, stats, onNavigate, onChapterSelect }) => {
  void isDarkMode;
  const statCards = useMemo(() => [
    { label: '已完成', value: stats.totalCompleted, color: 'text-blue-400' },
    { label: '答对', value: stats.totalCorrect, color: 'text-emerald-400' },
    { label: '正确率', value: `${stats.accuracy}%`, color: 'text-amber-400' },
    { label: '待攻克', value: stats.totalWrong, color: 'text-red-400' },
    { label: '已收藏', value: stats.totalBookmarked, color: 'text-purple-400' },
  ], [stats]);

  const getChapterProgress = (chapterId: string) => {
    const ch = chapters.find(c => c.id === chapterId);
    if (!ch) return { correct: 0, total: 0 };
    return { correct: Math.min(stats.chapterStats[chapterId]?.correct || 0, ch.questionIds.length), total: ch.questionIds.length };
  };

  const trainingModes = [
    { icon: <ListOrdered className="w-5 h-5" />, name: '代码填空', desc: '在代码中填写缺失关键字' },
    { icon: <Target className="w-5 h-5" />, name: '输出预测', desc: '预测程序运行输出结果' },
    { icon: <Bug className="w-5 h-5" />, name: 'Debug找错', desc: '找出代码中的错误' },
    { icon: <ArrowUpDown className="w-5 h-5" />, name: '代码排序', desc: '按正确顺序组装代码' },
    { icon: <Keyboard className="w-5 h-5" />, name: '代码跟打', desc: '反复打字强化记忆', action: () => onNavigate('typing') },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
          输入式答题 · 拒绝无脑选择
        </h1>
        <p className="opacity-60 text-lg">嵌入式系统开发实战练习平台</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {statCards.map((card) => (
          <Card key={card.label} className="glass hover:scale-105 transition-transform cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
              <div className="text-xs opacity-50 mt-1">{card.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 mb-8">
        {stats.totalWrong > 0 && (
          <Button variant="outline" onClick={() => onNavigate('review')} className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-400" /> 复习错题
          </Button>
        )}
        {stats.totalBookmarked > 0 && (
          <Button variant="outline" onClick={() => onNavigate('bookmarked')} className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-purple-400" /> 查看收藏
          </Button>
        )}
      </div>

      <h2 className="text-xl font-bold mb-4">章节练习</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {chapters.map((ch) => {
          const prog = getChapterProgress(ch.id);
          const pct = prog.total > 0 ? Math.round((prog.correct / prog.total) * 100) : 0;
          return (
            <Card key={ch.id} className="glass glass-hover cursor-pointer" onClick={() => onChapterSelect(ch.id)}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-amber-400">{modeIcons[ch.icon] || <BookOpen className="w-6 h-6" />}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{ch.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${ch.type === 'exam' ? 'bg-amber-500/20 text-amber-400' : ch.type === 'test' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {ch.type === 'exam' ? '真题' : ch.type === 'test' ? '测试' : '练习'}
                      </span>
                    </div>
                    <p className="text-sm opacity-50 mt-1">{ch.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={pct} className="flex-1" />
                  <span className="text-xs opacity-50">{prog.correct}/{prog.total}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <h2 className="text-xl font-bold mb-4">训练模式</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {trainingModes.map((mode) => (
          <Card key={mode.name} className="glass glass-hover cursor-pointer" onClick={mode.action || undefined}>
            <CardContent className="p-5 text-center">
              <div className="text-amber-400 mb-2 flex justify-center">{mode.icon}</div>
              <h3 className="font-semibold text-sm">{mode.name}</h3>
              <p className="text-xs opacity-50 mt-1">{mode.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
});
HomeView.displayName = 'HomeView';
