import React, { useState, memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CodeBlock } from './SyntaxHighlighter';
import { projects } from '@/data/projects';

interface ProjectViewProps {
  isDarkMode: boolean;
  projectId: string;
  onNavigate: (view: string) => void;
}

export const ProjectView: React.FC<ProjectViewProps> = memo(({ isDarkMode, projectId, onNavigate }) => {
  void isDarkMode;
  const project = projects.find(p => p.id === projectId);
  const [currentFrag, setCurrentFrag] = useState(0);

  if (!project) {
    return <div className="flex items-center justify-center h-full"><p>项目未找到</p></div>;
  }

  const frag = project.fragments[currentFrag];

  return (
    <div className="max-w-none mx-auto px-4 py-4">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('projects')}>
          <ChevronLeft className="w-4 h-4" /> 返回
        </Button>
        <h2 className="font-bold text-lg">{project.name}</h2>
        <span className="text-sm opacity-50">片段 {currentFrag + 1}/{project.fragments.length}</span>
      </div>
      <div className="flex justify-between mb-4">
        <Button variant="outline" size="sm" onClick={() => setCurrentFrag(i => Math.max(0, i - 1))} disabled={currentFrag === 0}>
          <ChevronLeft className="w-4 h-4" /> 上一片
        </Button>
        <Button variant="outline" size="sm" onClick={() => setCurrentFrag(i => Math.min(project.fragments.length - 1, i + 1))} disabled={currentFrag === project.fragments.length - 1}>
          下一片 <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <div className="glass rounded-2xl p-4 mb-4">
        <p className="text-sm opacity-60 mb-3">{frag.explanation}</p>
        {frag.tags && (
          <div className="flex gap-2 mb-3">
            {frag.tags.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded bg-white/10">{t}</span>)}
          </div>
        )}
        <CodeBlock code={frag.code} showLineNumbers />
      </div>
      <div className="flex gap-2 justify-center">
        {project.fragments.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentFrag(i)}
            className={`w-3 h-3 rounded-full transition-colors ${i === currentFrag ? 'bg-amber-400' : 'bg-white/20'}`}
          />
        ))}
      </div>
    </div>
  );
});
ProjectView.displayName = 'ProjectView';
