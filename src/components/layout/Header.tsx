import React, { useEffect, useState } from 'react';
import { ManagerNavigationItem } from '../../types';
import { checkBackendHealth } from '../../utils/api';
import { UserSearch, Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  currentPage: ManagerNavigationItem;
  onOpenMobileSidebar: () => void;
  onNavigate: (page: ManagerNavigationItem) => void;
  managerName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onOpenMobileSidebar,
  onNavigate,
  managerName = 'Bank Manager',
}) => {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      const isUp = await checkBackendHealth();
      if (isMounted) setBackendOnline(isUp);
    };
    check();
    const interval = setInterval(check, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const pageTitles: Record<ManagerNavigationItem, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Campaign Overview',
      subtitle: 'Understand customer response patterns and prioritise campaign efforts.',
    },
    assessment: {
      title: 'Customer Interest Assessment',
      subtitle: 'Enter customer details to assess their likelihood of interest in a term deposit.',
    },
    explorer: {
      title: 'Campaign Analysis',
      subtitle: 'Analyse campaign performance across multi-dimensional customer groups.',
    },
    help: {
      title: 'Help & Guidance',
      subtitle: 'Understand how to use the Bank Campaign Intelligence system effectively.',
    },
  };

  const currentInfo = pageTitles[currentPage] ?? pageTitles.dashboard;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-sm border-b border-slate-200/80 dark:border-[#263247] px-4 sm:px-8 py-4 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Title */}
        <div className="flex items-start gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-0.5">
              {currentInfo.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Status + Theme Toggle + Manager Profile + Action */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Assessment Service Status */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
              backendOnline === true
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : backendOnline === false
                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
            }`}
            title={
              backendOnline === true
                ? 'Assessment service is running'
                : 'Assessment service is offline'
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline === true
                  ? 'bg-emerald-500 animate-pulse'
                  : backendOnline === false
                  ? 'bg-amber-500'
                  : 'bg-slate-400 animate-pulse'
              }`}
            />
            <span>
              {backendOnline === true
                ? 'Assessment: Ready'
                : backendOnline === false
                ? 'Assessment: Offline'
                : 'Checking...'}
            </span>
          </div>

          {/* Theme Toggle Button (☀ / ☾) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#172033] border border-slate-200 dark:border-[#263247] transition-colors"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Manager Badge */}
          <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-[#172033] border border-slate-200 dark:border-[#263247] text-xs font-semibold text-slate-700 dark:text-slate-200">
            {managerName || 'Bank Manager'}
          </span>

          <button
            onClick={() => onNavigate('assessment')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors shadow-sm"
          >
            <UserSearch className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Assess Customer</span>
          </button>
        </div>
      </div>
    </header>
  );
};
