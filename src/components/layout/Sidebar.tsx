import React from 'react';
import {
  LayoutDashboard,
  UserSearch,
  Search,
  HelpCircle,
  FlaskConical,
  ChevronLeft,
  ChevronRight,
  Landmark,
  LogOut,
} from 'lucide-react';
import { ManagerNavigationItem } from '../../types';

interface SidebarProps {
  currentPage: ManagerNavigationItem;
  onNavigate: (page: ManagerNavigationItem) => void;
  onOpenProjectInfo: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  managerName?: string;
  onLogout?: () => void;
}

interface NavItem {
  id: ManagerNavigationItem;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    id: 'assessment',
    label: 'Customer Assessment',
    icon: <UserSearch className="w-4 h-4" />,
  },
  {
    id: 'explorer',
    label: 'Campaign Explorer',
    icon: <Search className="w-4 h-4" />,
  },
  {
    id: 'help',
    label: 'Help',
    icon: <HelpCircle className="w-4 h-4" />,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  onOpenProjectInfo,
  collapsed,
  onToggleCollapse,
  managerName = 'Bank Manager',
  onLogout,
}) => {
  const initials = 'BM';

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen bg-white dark:bg-[#111827] border-r border-slate-200/90 dark:border-[#263247] transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 border-b border-slate-100 dark:border-[#263247] flex items-center justify-between px-4">
        {!collapsed ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-sm shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                Bank Campaign Intelligence
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 truncate">
                Decision Support System
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-sm">
            <Landmark className="w-5 h-5" />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#172033] rounded-lg transition-colors hidden md:flex items-center justify-center"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
        {!collapsed && (
          <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navigation
          </p>
        )}
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 relative group ${
                isActive
                  ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold shadow-xs border border-brand-100 dark:border-brand-900/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#172033]'
              }`}
            >
              <span
                className={`shrink-0 transition-colors ${
                  isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              >
                {item.icon}
              </span>

              {!collapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}

              {!collapsed && item.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider">
                  {item.badge}
                </span>
              )}

              {isActive && (
                <span className="absolute right-0 top-2 bottom-2 w-0.5 bg-brand-600 dark:bg-brand-400 rounded-l" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer — Manager identity + Logout */}
      <div className="p-3 border-t border-slate-100 dark:border-[#263247] bg-slate-50/50 dark:bg-[#172033]/50 space-y-2">
        <button
          onClick={onOpenProjectInfo}
          className="w-full flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-[#172033] border border-slate-200/80 dark:border-[#263247] hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xs transition-all text-left group"
        >
          <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-950/50 border border-brand-100 dark:border-brand-800 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-xs shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="truncate flex-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate leading-none">
                {managerName || 'Bank Manager'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1 truncate">
                Campaign Manager
              </p>
            </div>
          )}
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            title="Sign out"
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        )}
      </div>
    </aside>
  );
};
