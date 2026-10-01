import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  description: string;
  icon?: React.ReactNode;
  badge?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  description,
  icon,
  badge,
  trend,
  className = '',
}) => {
  return (
    <div className={`bg-white dark:bg-[#172033] rounded-xl border border-slate-200/80 dark:border-[#263247] p-5 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {icon && (
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#111827] text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-[#263247]">
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {value}
        </span>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend.isPositive ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/50' : 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800'
          }`}>
            {trend.value}
          </span>
        )}
        {badge && (
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-100 dark:border-brand-800">
            {badge}
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
        {description}
      </p>
    </div>
  );
};
