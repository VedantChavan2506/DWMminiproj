import React from 'react';
import { Lightbulb, Info, AlertCircle, CheckCircle2 } from 'lucide-react';

interface InsightCardProps {
  title: string;
  type?: 'insight' | 'info' | 'warning' | 'conclusion';
  children: React.ReactNode;
  className?: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  type = 'insight',
  children,
  className = '',
}) => {
  const configs = {
    insight: {
      icon: <Lightbulb className="w-5 h-5 text-amber-600 shrink-0" />,
      bg: 'bg-amber-50/70 border-amber-200/80 text-amber-950',
      badge: 'Analytical Insight',
      badgeBg: 'bg-amber-100/80 text-amber-800',
    },
    info: {
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
      bg: 'bg-blue-50/70 border-blue-200/80 text-blue-950',
      badge: 'Methodology Note',
      badgeBg: 'bg-blue-100/80 text-blue-800',
    },
    warning: {
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
      bg: 'bg-rose-50/70 border-rose-200/80 text-rose-950',
      badge: 'Critical Finding',
      badgeBg: 'bg-rose-100/80 text-rose-800',
    },
    conclusion: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      bg: 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950',
      badge: 'Key Takeaway',
      badgeBg: 'bg-emerald-100/80 text-emerald-800',
    },
  };

  const config = configs[type];

  return (
    <div className={`rounded-xl border p-5 ${config.bg} ${className}`}>
      <div className="flex items-center gap-2.5 mb-2.5">
        {config.icon}
        <h4 className="text-sm font-semibold tracking-tight">{title}</h4>
        <span className={`ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full ${config.badgeBg}`}>
          {config.badge}
        </span>
      </div>
      <div className="text-xs leading-relaxed space-y-1.5 opacity-90">
        {children}
      </div>
    </div>
  );
};

