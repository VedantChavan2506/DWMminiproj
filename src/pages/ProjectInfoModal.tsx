import React from 'react';
import { X, Users, Terminal, BookOpen, Landmark } from 'lucide-react';
import { Badge } from '../components/common/Badge';

interface ProjectInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectInfoModal: React.FC<ProjectInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const tools = [
    'Python 3.14',
    'Pandas',
    'Scikit-learn',
    'SMOTE (imbalanced-learn)',
    'XGBoost',
    'Flask & Flask-CORS',
    'SQLite (Star Schema Data Warehouse)',
    'React 18 & TypeScript',
    'Tailwind CSS (Dark Mode)',
    'Recharts',
    'Lucide Icons',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#172033] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-[#263247] animate-in zoom-in-95 duration-200 transition-colors">
        {/* Header */}
        <div className="p-6 bg-slate-900 dark:bg-[#111827] text-white flex items-start justify-between gap-4 border-b border-slate-800 dark:border-[#263247]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">
                Decision Support System
              </Badge>
              <Badge variant="neutral" size="sm">
                DWM &amp; ML
              </Badge>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white mt-1">
              Bank Campaign Intelligence
            </h3>
            <p className="text-xs text-slate-300">
              Campaign Decision Support System powered by SQLite Star Schema DW &amp; XGBoost
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs text-slate-700 dark:text-slate-300">
          {/* Project Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>System Specifications</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-[#263247] space-y-2 text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="flex justify-between border-b border-slate-200/60 dark:border-[#263247] pb-1.5">
                <span className="font-semibold text-slate-800 dark:text-slate-200">System Area:</span>
                <span>Data Warehousing &amp; Data Mining</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 dark:border-[#263247] pb-1.5">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Data Warehouse:</span>
                <span>SQLite Star Schema (41,188 facts)</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 dark:border-[#263247] pb-1.5">
                <span className="font-semibold text-slate-800 dark:text-slate-200">OLAP Operations:</span>
                <span>Roll-Up, Drill-Down, Slice, Dice</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Final Model:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">XGBoost (Post-SMOTE, AUC 0.945)</span>
              </div>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">
              <Terminal className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <span>Tools &amp; Frameworks</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tools.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-[11px]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#111827] border-t border-slate-100 dark:border-[#263247] text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
