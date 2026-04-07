import React, { memo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { projects } from '@/data/projects';
import { ViewType } from '@/types';

interface ProjectsListViewProps {
  isDarkMode: boolean;
  onSelectProject: (projectId: string) => void;
}

const diffColors: Record<string, string> = {
  '基础': 'bg-green-500/20 text-green-400',
  '中等': 'bg-amber-500/20 text-amber-400',
  '进阶': 'bg-orange-500/20 text-orange-400',
  '专家': 'bg-red-500/20 text-red-400',
};

export const ProjectsListView: React.FC<ProjectsListViewProps> = memo(({ isDarkMode, onSelectProject }) => (
  <div className="max-w-5xl mx-auto px-4 py-8">
    <h1 className="text-2xl font-bold mb-6">项目实战</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {projects.map(p => (
        <Card key={p.id} className="glass glass-hover cursor-pointer" onClick={() => onSelectProject(p.id)}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">{p.name}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${diffColors[p.difficulty] || 'bg-gray-500/20 text-gray-400'}`}>{p.difficulty}</span>
            </div>
            <p className="text-sm opacity-60 mb-3">{p.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {p.tags.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded bg-white/10">{t}</span>)}
              </div>
              <ChevronRight className="w-5 h-5 opacity-40" />
            </div>
            <div className="text-xs opacity-40 mt-2">{p.fragments.length} 个片段 · {p.fragments.reduce((a, f) => a + f.code.split('\n').length, 0)} 行代码</div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
));
ProjectsListView.displayName = 'ProjectsListView';
