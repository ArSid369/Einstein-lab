import React from 'react';
import {
  Archive,
  BarChart3,
  Bot,
  CheckCircle2,
  Clock,
  Code2,
  Cpu,
  FileEdit,
  Grid3X3,
  Lock,
  Network,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { DifficultyLevel, Domain, PublicationStatus } from '../../types/newtonlab';

export const DomainIcon: React.FC<{ iconKey: Domain['iconKey']; className?: string }> = ({
  iconKey,
  className = 'w-5 h-5',
}) => {
  switch (iconKey) {
    case 'python':
      return <Code2 className={className} />;
    case 'numpy':
      return <Grid3X3 className={className} />;
    case 'pandas':
      return <BarChart3 className={className} />;
    case 'sklearn':
      return <Sparkles className={className} />;
    case 'robotics':
      return <Bot className={className} />;
    case 'ros':
      return <Network className={className} />;
    default:
      return <Cpu className={className} />;
  }
};

export const StatusLabel: React.FC<{
  status: PublicationStatus | 'Completed' | 'Current' | 'Available' | 'Locked' | 'Passed' | 'Failed';
}> = ({ status }) => {
  switch (status) {
    case 'Published':
    case 'Completed':
    case 'Passed':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#16A34A] dark:text-[#84E179] whitespace-nowrap shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{status}</span>
        </span>
      );
    case 'Draft':
    case 'Current':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#D97706] dark:text-amber-400 whitespace-nowrap shrink-0">
          <FileEdit className="w-3.5 h-3.5" />
          <span>{status}</span>
        </span>
      );
    case 'Available':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#37852d] dark:text-[#84E179] whitespace-nowrap shrink-0">
          <Clock className="w-3.5 h-3.5" />
          <span>{status}</span>
        </span>
      );
    case 'Locked':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
          <Lock className="w-3.5 h-3.5" />
          <span>{status}</span>
        </span>
      );
    case 'Archived':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
          <Archive className="w-3.5 h-3.5" />
          <span>{status}</span>
        </span>
      );
    case 'Failed':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#DC2626] dark:text-red-400 whitespace-nowrap shrink-0">
          <XCircle className="w-3.5 h-3.5" />
          <span>{status}</span>
        </span>
      );
  }
};

export const DifficultyText: React.FC<{ level: DifficultyLevel | string }> = ({ level }) => {
  const color =
    level === 'Beginner'
      ? 'text-[#16A34A] dark:text-emerald-400'
      : level === 'Intermediate'
      ? 'text-[#D97706] dark:text-amber-400'
      : level === 'Advanced'
      ? 'text-[#37852d] dark:text-[#84E179]'
      : 'text-slate-600 dark:text-slate-300';

  return <span className={`text-xs font-medium ${color} whitespace-nowrap shrink-0`}>{level}</span>;
};

export const MetaRow: React.FC<{ items: Array<React.ReactNode>; className?: string }> = ({
  items,
  className = '',
}) => {
  const filtered = items.filter((item) => item !== null && item !== undefined && item !== '');
  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 ${className}`}>
      {filtered.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && (
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
              ·
            </span>
          )}
          <span className="inline-flex items-center gap-1">{item}</span>
        </React.Fragment>
      ))}
    </div>
  );
};

export const PageHeader: React.FC<{
  title: string;
  description?: string;
  actions?: React.ReactNode;
}> = ({ title, description, actions }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E2E8F0] dark:border-slate-800">
    <div className="min-w-0">
      <h1 className="text-2xl font-bold tracking-tight text-[#111827] dark:text-slate-100 text-balance">
        {title}
      </h1>
      {description && (
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">{description}</p>
      )}
    </div>
    {actions && <div className="flex items-center gap-3 shrink-0 flex-wrap">{actions}</div>}
  </div>
);
