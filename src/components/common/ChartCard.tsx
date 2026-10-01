import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  footer,
}) => {
  return (
    <div className={`bg-white dark:bg-[#172033] rounded-xl border border-slate-200/80 dark:border-[#263247] shadow-sm overflow-hidden flex flex-col transition-colors ${className}`}>
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-[#263247] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="flex items-center gap-2">
            {action}
          </div>
        )}
      </div>

      <div className="p-5 sm:p-6 flex-1 min-h-[280px]">
        {children}
      </div>

      {footer && (
        <div className="px-5 py-3.5 bg-slate-50/60 dark:bg-[#111827]/60 border-t border-slate-100 dark:border-[#263247] text-xs text-slate-500 dark:text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
};
