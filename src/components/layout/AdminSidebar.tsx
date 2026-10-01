import React from 'react';
import {
  Cpu,
  Code2,
  FileSpreadsheet,
  Workflow,
  Scale,
  BarChart3,
  BrainCircuit,
  RefreshCw,
  Database,
  Boxes,
  Layers,
  Server,
  Network,
  Map,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { AdminNavigationItem } from '../../types';

interface AdminSidebarProps {
  currentPage: AdminNavigationItem;
  onNavigate: (page: AdminNavigationItem) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  adminName?: string;
  onLogout: () => void;
}

interface AdminNavItem {
  id: AdminNavigationItem;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const adminNavItems: AdminNavItem[] = [
  {
    id: 'tech-overview',
    label: 'Technical Overview',
    icon: <Cpu className="w-4 h-4" />,
    badge: 'Main',
  },
  {
    id: 'python-impl',
    label: 'Python Implementation',
    icon: <Code2 className="w-4 h-4" />,
    badge: 'Core',
  },
  {
    id: 'dataset',
    label: 'Dataset',
    icon: <FileSpreadsheet className="w-4 h-4" />,
  },
  {
    id: 'preprocessing',
    label: 'Data Preprocessing',
    icon: <Workflow className="w-4 h-4" />,
  },
  {
    id: 'smote-analysis',
    label: 'SMOTE Analysis',
    icon: <Scale className="w-4 h-4" />,
    badge: 'Balancing',
  },
  {
    id: 'model-comparison',
    label: 'Model Comparison',
    icon: <BarChart3 className="w-4 h-4" />,
    badge: '4 Models',
  },
  {
    id: 'machine-learning',
    label: 'Machine Learning',
    icon: <BrainCircuit className="w-4 h-4" />,
    badge: 'XGBoost',
  },
  {
    id: 'etl-process',
    label: 'ETL Pipeline',
    icon: <RefreshCw className="w-4 h-4" />,
  },
  {
    id: 'data-warehouse',
    label: 'Data Warehouse',
    icon: <Database className="w-4 h-4" />,
    badge: 'SQLite',
  },
  {
    id: 'star-schema',
    label: 'Star Schema',
    icon: <Boxes className="w-4 h-4" />,
    badge: 'DWM',
  },
  {
    id: 'olap-ops',
    label: 'OLAP Analysis',
    icon: <Layers className="w-4 h-4" />,
    badge: '4 Ops',
  },
  {
    id: 'backend-api',
    label: 'Backend / API',
    icon: <Server className="w-4 h-4" />,
    badge: 'Flask',
  },
  {
    id: 'architecture',
    label: 'System Architecture',
    icon: <Network className="w-4 h-4" />,
  },
  {
    id: 'project-map',
    label: 'Project Information',
    icon: <Map className="w-4 h-4" />,
    badge: 'Technical',
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentPage,
  onNavigate,
  collapsed,
  onToggleCollapse,
  adminName = 'System Administrator',
  onLogout,
}) => {
  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen bg-slate-950 dark:bg-[#070d19] text-slate-200 border-r border-slate-800 dark:border-[#1e293b] transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 border-b border-slate-800 dark:border-[#1e293b] flex items-center justify-between px-4 shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h1 className="text-sm font-bold text-white tracking-tight leading-none">
                Bank Campaign Intel
              </h1>
              <p className="text-[11px] text-indigo-400 font-semibold mt-1 truncate flex items-center gap-1">
                <Sparkles className="w-3 h-3 inline" /> System Administrator
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors hidden md:flex items-center justify-center"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1 custom-scrollbar">
        {!collapsed && (
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            TECHNICAL ADMINISTRATION
          </div>
        )}

        {adminNavItems.map((item) => {
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 relative group ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <span
                className={`shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-300'
                }`}
              >
                {item.icon}
              </span>

              {!collapsed && (
                <>
                  <span className="truncate flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Admin User Footer & Logout */}
      <div className="p-3 border-t border-slate-800 dark:border-[#1e293b] shrink-0 bg-slate-950/60">
        {!collapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-indigo-900/60 border border-indigo-700/50 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">
                SA
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  System Administrator
                </p>
                <span className="inline-block text-[9px] uppercase font-bold tracking-wider text-emerald-400">
                  Technical Role
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogout}
            className="w-full flex justify-center p-2 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};

export default AdminSidebar;
