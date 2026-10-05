import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  ArrowRight,
  Table as TableIcon,
  Sparkles,
  BookOpen,
  ShieldCheck,
  TrendingUp,
  FileCheck,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import {
  MODELS_BEFORE_SMOTE,
  MODELS_AFTER_SMOTE,
  XGBOOST_FINAL_METRICS,
  XGBOOST_CONFUSION_MATRIX,
  SMOTE_DISTRIBUTION,
  TOP_10_FEATURES,
} from '../../data/modelMetrics';
import { fetchWarehouseTables, fetchTableSample } from '../../utils/api';
import { AdminNavigationItem, WarehouseSchemaResponse, WarehouseTableSample } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface AdminDashboardPageProps {
  activeTab: AdminNavigationItem;
  onNavigate: (tab: AdminNavigationItem) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  activeTab,
  onNavigate,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Metric filter for Model Comparison chart
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'accuracy' | 'precision' | 'recall' | 'f1'>('all');

  // Live Warehouse schema state
  const [schema, setSchema] = useState<WarehouseSchemaResponse | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>('fact_campaign');
  const [tableSample, setTableSample] = useState<WarehouseTableSample | null>(null);
  const [loadingSample, setLoadingSample] = useState<boolean>(false);

  useEffect(() => {
    fetchWarehouseTables()
      .then((data) => setSchema(data))
      .catch((err) => console.error('Failed to fetch warehouse schema:', err));
  }, []);

  useEffect(() => {
    if (selectedTable) {
      setLoadingSample(true);
      fetchTableSample(selectedTable, 6)
        .then((data) => setTableSample(data))
        .catch((err) => console.error('Failed to fetch table sample:', err))
        .finally(() => setLoadingSample(false));
    }
  }, [selectedTable]);

  // SMOTE chart data
  const smoteChartData = [
    {
      name: 'No Subscription (y=no)',
      'Before SMOTE': SMOTE_DISTRIBUTION.before.no,
      'After SMOTE': SMOTE_DISTRIBUTION.after.no,
    },
    {
      name: 'Subscription (y=yes)',
      'Before SMOTE': SMOTE_DISTRIBUTION.before.yes,
      'After SMOTE': SMOTE_DISTRIBUTION.after.yes,
    },
  ];

  // Model comparison chart data (After SMOTE)
  const modelChartData = MODELS_AFTER_SMOTE.map((m) => ({
    name: m.model,
    Accuracy: +(m.accuracy * 100).toFixed(1),
    Precision: +(m.precision * 100).toFixed(1),
    Recall: +(m.recall * 100).toFixed(1),
    'F1 Score': +(m.f1 * 100).toFixed(1),
  }));

  const chartTooltipStyle = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    borderColor: isDark ? '#334155' : '#cbd5e1',
    borderRadius: '8px',
    fontSize: '12px',
    color: isDark ? '#f8fafc' : '#0f172a',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  };

  return (
    <div className="space-y-8 pb-16">
      {/* ── Admin Top Header ── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
              <Cpu className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                  Technical Project Overview
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Technical Project Evaluation
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight mt-1">
                Technical Project Overview
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Machine Learning, Data Warehouse and OLAP Implementation
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('model-comparison')}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Model Comparison</span>
            </button>
            <button
              onClick={() => onNavigate('smote-analysis')}
              className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>SMOTE Analysis</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── TECHNICAL SUMMARY CARDS (Top of Dashboard) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Dataset</span>
          <p className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">41,188</p>
          <p className="text-[10px] text-slate-500">Actual records</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Features</span>
          <p className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">8</p>
          <p className="text-[10px] text-slate-500">Features used</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">ML Problem</span>
          <p className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 leading-tight">Binary</p>
          <p className="text-[10px] text-slate-500">Classification</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Deployed Model</span>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 truncate">XGBoost</p>
          <p className="text-[10px] text-slate-500">Classifier</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Data Warehouse</span>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">SQLite</p>
          <p className="text-[10px] text-slate-500 font-mono">bank_warehouse.db</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Data Model</span>
          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1.5 leading-tight">Star Schema</p>
          <p className="text-[10px] text-slate-500">1 Fact + 4 Dims</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">OLAP Operations</span>
          <p className="text-lg font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">4</p>
          <p className="text-[10px] text-slate-500">Roll/Drill/Slice/Dice</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Class Balancing</span>
          <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-1">SMOTE</p>
          <p className="text-[10px] text-slate-500">sampling_strategy=0.5</p>
        </div>
      </div>

      {/* ── SECTION: PROMINENT MODEL PERFORMANCE COMPARISON (Visible on Overview & Model Comparison) ── */}
      {(activeTab === 'tech-overview' || activeTab === 'model-comparison') && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Model Performance Comparison
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Benchmark of evaluated algorithms under SMOTE-balanced training conditions.
              </p>
            </div>

            {/* Metric Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
              {(['all', 'accuracy', 'precision', 'recall', 'f1'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMetric(m)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    selectedMetric === m
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {m === 'all' ? 'All Metrics' : m.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Grouped Bar Chart */}
          <div className="h-[290px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelChartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                <YAxis unit="%" domain={[0, 100]} stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(val: any) => [`${val}%`]} />
                <Legend />
                {(selectedMetric === 'all' || selectedMetric === 'accuracy') && (
                  <Bar dataKey="Accuracy" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                )}
                {(selectedMetric === 'all' || selectedMetric === 'precision') && (
                  <Bar dataKey="Precision" fill="#10b981" radius={[4, 4, 0, 0]} />
                )}
                {(selectedMetric === 'all' || selectedMetric === 'recall') && (
                  <Bar dataKey="Recall" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                )}
                {(selectedMetric === 'all' || selectedMetric === 'f1') && (
                  <Bar dataKey="F1 Score" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Side-by-Side Model Benchmark Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 text-left">Model Algorithm</th>
                  <th className="py-2.5 px-3 text-left">Accuracy</th>
                  <th className="py-2.5 px-3 text-left">Precision</th>
                  <th className="py-2.5 px-3 text-left">Recall</th>
                  <th className="py-2.5 px-3 text-left">F1 Score</th>
                  <th className="py-2.5 px-3 text-left">ROC-AUC</th>
                  <th className="py-2.5 px-3 text-left">Deployment Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                {MODELS_AFTER_SMOTE.map((m) => {
                  const isWinner = m.model === 'XGBoost';
                  return (
                    <tr
                      key={m.model}
                      className={isWinner ? 'bg-indigo-50/60 dark:bg-indigo-950/40 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}
                    >
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {m.model}
                        {isWinner && (
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-indigo-600 text-white font-mono">
                            Selected
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{(m.accuracy * 100).toFixed(2)}%</td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{(m.precision * 100).toFixed(2)}%</td>
                      <td className="py-2.5 px-3 text-purple-600 dark:text-purple-400 font-bold">{(m.recall * 100).toFixed(2)}%</td>
                      <td className="py-2.5 px-3 text-indigo-600 dark:text-indigo-400 font-bold">{(m.f1 * 100).toFixed(2)}%</td>
                      <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400">{(m.auc ? m.auc * 100 : 0).toFixed(2)}%</td>
                      <td className="py-2.5 px-3 font-sans">
                        {isWinner ? (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Deployed Model
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Benchmarked Baseline</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SECTION: DEPLOYED MODEL SPECIFICATIONS (Visible on Overview & Machine Learning) ── */}
      {(activeTab === 'tech-overview' || activeTab === 'machine-learning') && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Deployed Model: XGBoost Classifier
              </h3>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Active in /predict Endpoint
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Model Architecture</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">XGBoost Classifier</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Gradient-boosted decision trees with binary logloss objective.</p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-indigo-500">
                n_estimators=200, max_depth=5, lr=0.05
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Classification Task</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Binary Classification</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Target variable: <code className="font-mono text-indigo-500 font-bold">y</code> ('yes' vs 'no')</p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-emerald-500">
                Prediction API: POST /predict
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Persisted Artifacts</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Joblib Pickle Files</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                backend/model/xgb_model.pkl<br />
                backend/model/preprocessor.pkl
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-indigo-500">
                Loaded on Flask startup
              </div>
            </div>
          </div>

          {/* Test Set Confusion Matrix */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Test Set Confusion Matrix (8,236 Holdout Test Records)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                <span className="text-[10px] font-bold text-emerald-600 uppercase">True Negative (TN)</span>
                <p className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-300 mt-1">6,744</p>
                <p className="text-[10px] text-emerald-600/80">Correct non-subscribers</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                <span className="text-[10px] font-bold text-amber-600 uppercase">False Positive (FP)</span>
                <p className="text-lg font-bold font-mono text-amber-700 dark:text-amber-300 mt-1">564</p>
                <p className="text-[10px] text-amber-600/80">Contacted, no deposit</p>
              </div>
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
                <span className="text-[10px] font-bold text-rose-600 uppercase">False Negative (FN)</span>
                <p className="text-lg font-bold font-mono text-rose-700 dark:text-rose-300 mt-1">198</p>
                <p className="text-[10px] text-rose-600/80">Missed subscribers</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                <span className="text-[10px] font-bold text-emerald-600 uppercase">True Positive (TP)</span>
                <p className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-300 mt-1">730</p>
                <p className="text-[10px] text-emerald-600/80">Captured subscribers</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION: SMOTE CLASS BALANCING ANALYSIS (Visible on SMOTE Analysis page) ── */}
      {activeTab === 'smote-analysis' && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                SMOTE Class Balancing Analysis
              </h3>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              imblearn.over_sampling.SMOTE
            </span>
          </div>

          {/* Class Distribution Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Before SMOTE (Original Train)</span>
              <div className="mt-2 space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Majority (No):</span>
                  <span className="font-bold text-slate-900 dark:text-white">29,229 (88.73%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Minority (Yes):</span>
                  <span className="font-bold text-amber-600">3,711 (11.27%)</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-800 font-bold">
                  <span>Total Training Samples:</span>
                  <span>32,940 (Ratio 1 : 7.9)</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">After SMOTE (Resampled Train)</span>
              <div className="mt-2 space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Majority (No):</span>
                  <span className="font-bold text-slate-900 dark:text-white">29,229 (66.67%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Minority (Yes):</span>
                  <span className="font-bold text-emerald-600">14,614 (33.33%)</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-800 font-bold">
                  <span>Total Training Samples:</span>
                  <span>43,843 (Ratio 1 : 2.0)</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Balancing Technique &amp; Scope</span>
              <div className="mt-2 space-y-1.5 text-xs">
                <p className="font-bold text-slate-900 dark:text-white">Synthetic Minority Over-sampling</p>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Synthesized <strong>10,903 minority samples</strong> in feature space using k-nearest neighbors.
                </p>
                <div className="pt-1 text-[11px] text-indigo-500 font-mono font-bold">
                  Applied strictly on X_train (0% leakage)
                </div>
              </div>
            </div>
          </div>

          {/* Grouped Bar Chart */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Class Distribution Before vs After SMOTE
            </h4>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={smoteChartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                  <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                  <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend />
                  <Bar dataKey="Before SMOTE" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="After SMOTE" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Model Performance Before vs After SMOTE Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Model Performance Before vs After SMOTE (Empirical Evidence)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 text-left">Model Algorithm</th>
                    <th className="py-2.5 px-3 text-left">Condition</th>
                    <th className="py-2.5 px-3 text-left">Accuracy</th>
                    <th className="py-2.5 px-3 text-left">Precision</th>
                    <th className="py-2.5 px-3 text-left">Recall</th>
                    <th className="py-2.5 px-3 text-left">F1 Score</th>
                    <th className="py-2.5 px-3 text-left">Recall Improvement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  {MODELS_BEFORE_SMOTE.map((mBefore, idx) => {
                    const mAfter = MODELS_AFTER_SMOTE[idx];
                    const recallGain = +((mAfter.recall - mBefore.recall) * 100).toFixed(2);
                    return (
                      <React.Fragment key={mBefore.model}>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                          <td rowSpan={2} className="py-3 px-3 font-sans font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800">
                            {mBefore.model}
                          </td>
                          <td className="py-2 px-3 text-amber-600 font-semibold font-sans">Before SMOTE</td>
                          <td className="py-2 px-3">{(mBefore.accuracy * 100).toFixed(2)}%</td>
                          <td className="py-2 px-3">{(mBefore.precision * 100).toFixed(2)}%</td>
                          <td className="py-2 px-3">{(mBefore.recall * 100).toFixed(2)}%</td>
                          <td className="py-2 px-3">{(mBefore.f1 * 100).toFixed(2)}%</td>
                          <td rowSpan={2} className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400 font-sans border-l border-slate-200 dark:border-slate-800">
                            +{recallGain}% gain
                          </td>
                        </tr>
                        <tr className="bg-slate-50/50 dark:bg-slate-900/30">
                          <td className="py-2 px-3 text-indigo-600 dark:text-indigo-400 font-semibold font-sans">After SMOTE</td>
                          <td className="py-2 px-3">{(mAfter.accuracy * 100).toFixed(2)}%</td>
                          <td className="py-2 px-3">{(mAfter.precision * 100).toFixed(2)}%</td>
                          <td className="py-2 px-3 font-bold text-purple-600 dark:text-purple-400">{(mAfter.recall * 100).toFixed(2)}%</td>
                          <td className="py-2 px-3 font-bold text-indigo-600 dark:text-indigo-400">{(mAfter.f1 * 100).toFixed(2)}%</td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION: DATA PREPROCESSING PIPELINE (Visible on Overview & Preprocessing) ── */}
      {(activeTab === 'tech-overview' || activeTab === 'preprocessing') && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Data Preprocessing Pipeline (Actual Execution Order)
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Chronological sequence of transformations implemented in <code className="font-mono text-indigo-500">backend/train_and_save.py</code>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 text-center">
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">1. Raw Dataset</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">bank-additional-full.csv</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">41,188 rows, sep=';'</p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">2. Feature Selection</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">8 Core Features</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Drop duplicates (12 rows)</p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">3. Stratified Split</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">80% Train / 20% Test</p>
              <p className="text-[10px] text-slate-500 mt-0.5">stratify=y, seed=42</p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">4. Numerical Scaling</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">StandardScaler</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">age, campaign, duration...</p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">5. Categorical Encoding</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">OneHotEncoder</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">job, contact, poutcome</p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-amber-500 uppercase">6. SMOTE Oversample</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">X_train SMOTE</p>
              <p className="text-[10px] text-slate-500 mt-0.5">sampling_strategy=0.5</p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-emerald-500 uppercase">7. Model Training</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">XGBClassifier</p>
              <p className="text-[10px] text-slate-500 mt-0.5">200 trees, depth 5</p>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION: DATA WAREHOUSE & STAR SCHEMA (Visible on Star Schema & Data Warehouse pages) ── */}
      {(activeTab === 'star-schema' || activeTab === 'data-warehouse') && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Data Warehouse &amp; Star Schema Design
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Central fact table <code className="font-mono text-indigo-500">fact_campaign</code> linked to 4 dimension tables.
              </p>
            </div>

            {/* Table Sample Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Inspect Table:</span>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white outline-none"
              >
                <option value="fact_campaign">fact_campaign (Fact Table)</option>
                <option value="dim_customer">dim_customer (Dimension)</option>
                <option value="dim_contact">dim_contact (Dimension)</option>
                <option value="dim_campaign_history">dim_campaign_history (Dimension)</option>
                <option value="dim_market">dim_market (Dimension)</option>
              </select>
            </div>
          </div>

          {/* Star Schema Interactive Diagram */}
          <div className="p-6 rounded-xl bg-slate-900 text-white border border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Left Dimensions */}
              <div className="space-y-4">
                <div
                  onClick={() => setSelectedTable('dim_customer')}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    selectedTable === 'dim_customer'
                      ? 'border-indigo-500 bg-indigo-950/40 shadow-sm shadow-indigo-500/30'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-indigo-300">dim_customer</span>
                    <span className="text-[10px] text-slate-400 font-mono">41,188 rows</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                    <span className="text-amber-400 font-bold">PK</span> customer_key | age, job, marital, education, default, housing, loan
                  </p>
                </div>

                <div
                  onClick={() => setSelectedTable('dim_contact')}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    selectedTable === 'dim_contact'
                      ? 'border-indigo-500 bg-indigo-950/40 shadow-sm shadow-indigo-500/30'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-indigo-300">dim_contact</span>
                    <span className="text-[10px] text-slate-400 font-mono">Unique Channels</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                    <span className="text-amber-400 font-bold">PK</span> contact_key | contact, month, day_of_week
                  </p>
                </div>
              </div>

              {/* Central Fact */}
              <div
                onClick={() => setSelectedTable('fact_campaign')}
                className={`p-5 rounded-xl border cursor-pointer transition-all text-center ${
                  selectedTable === 'fact_campaign'
                    ? 'border-indigo-400 bg-indigo-900/30 shadow-lg shadow-indigo-500/20'
                    : 'border-indigo-500/50 bg-slate-950/80 hover:border-indigo-400'
                }`}
              >
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-2 border border-indigo-500/30">
                  Central Fact Table
                </div>
                <h4 className="text-base font-bold text-white mb-1">fact_campaign</h4>
                <p className="text-xs text-indigo-200 font-mono mb-3">41,188 Campaign Records</p>
                <div className="text-left text-[10px] font-mono text-slate-300 space-y-1 bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                  <div><span className="text-amber-400 font-bold">PK</span> record_key (INTEGER)</div>
                  <div><span className="text-blue-400 font-bold">FK</span> customer_key &rarr; dim_customer</div>
                  <div><span className="text-blue-400 font-bold">FK</span> contact_key &rarr; dim_contact</div>
                  <div><span className="text-blue-400 font-bold">FK</span> campaign_history_key &rarr; dim_campaign_history</div>
                  <div><span className="text-blue-400 font-bold">FK</span> market_key &rarr; dim_market</div>
                  <div className="pt-1 border-t border-slate-800 text-emerald-400">
                    Measures: campaign_contacts, duration, response ('yes'/'no')
                  </div>
                </div>
              </div>

              {/* Right Dimensions */}
              <div className="space-y-4">
                <div
                  onClick={() => setSelectedTable('dim_campaign_history')}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    selectedTable === 'dim_campaign_history'
                      ? 'border-indigo-500 bg-indigo-950/40 shadow-sm shadow-indigo-500/30'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-indigo-300">dim_campaign_history</span>
                    <span className="text-[10px] text-slate-400 font-mono">Prior History</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                    <span className="text-amber-400 font-bold">PK</span> campaign_history_key | previous, pdays, poutcome
                  </p>
                </div>

                <div
                  onClick={() => setSelectedTable('dim_market')}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    selectedTable === 'dim_market'
                      ? 'border-indigo-500 bg-indigo-950/40 shadow-sm shadow-indigo-500/30'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-indigo-300">dim_market</span>
                    <span className="text-[10px] text-slate-400 font-mono">Macroeconomic</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                    <span className="text-amber-400 font-bold">PK</span> market_key | emp_var_rate, cons_price_idx, euribor3m...
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Live SQLite Table Samples */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Live SQLite Warehouse Sample: <code className="text-indigo-600 dark:text-indigo-400 font-mono">{selectedTable}</code>
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {tableSample ? `${tableSample.total_records.toLocaleString()} rows verified in SQLite` : 'Querying...'}
              </span>
            </div>

            {loadingSample ? (
              <div className="p-8 text-center text-xs text-slate-500">Querying SQLite warehouse...</div>
            ) : tableSample && tableSample.sample_rows.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                    <tr>
                      {tableSample.columns.map((col) => (
                        <th key={col} className="py-2 px-3 text-left border-b border-slate-200 dark:border-slate-800">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                    {tableSample.sample_rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        {tableSample.columns.map((col) => (
                          <td key={col} className="py-2 px-3 text-slate-700 dark:text-slate-300">
                            {String(row[col] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">No records found.</div>
            )}
          </div>
        </div>
      )}

      {/* ── SECTION: OLAP ANALYSIS (Visible on OLAP Operations page) ── */}
      {activeTab === 'olap-ops' && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              OLAP Operations: Academic Implementation &amp; SQL Queries
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Implemented in <code className="font-mono text-indigo-500">backend/warehouse/warehouse_service.py</code> querying <code className="font-mono text-indigo-500">bank_warehouse.db</code>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. ROLL-UP */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">1. ROLL-UP</h4>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  Manager Label: Campaign Summary
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Summarizes detailed records up a dimension hierarchy (e.g. customer age into demographic brackets).
              </p>
              <div className="text-[11px] font-mono p-3 rounded-lg bg-slate-900 text-slate-200 overflow-x-auto">
                <div className="text-indigo-400 font-bold mb-1">// Python Function:</div>
                olap_rollup(dimension="age_group")<br />
                <div className="text-emerald-400 font-bold mt-2 mb-1">// SQL Execution:</div>
                SELECT group_name, COUNT(*), SUM(response='yes')<br />
                FROM fact_campaign f JOIN dim_customer c ...<br />
                GROUP BY group_name;
              </div>
            </div>

            {/* 2. DRILL-DOWN */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">2. DRILL-DOWN</h4>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  Manager Label: Explore Performance
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Navigates from higher-level summary into granular sub-attributes (e.g. age group 36-45 into occupation breakdown).
              </p>
              <div className="text-[11px] font-mono p-3 rounded-lg bg-slate-900 text-slate-200 overflow-x-auto">
                <div className="text-indigo-400 font-bold mb-1">// Python Function:</div>
                olap_drilldown(parent_dim="age_group", parent_value="36-45", drill_dim="occupation")<br />
                <div className="text-emerald-400 font-bold mt-2 mb-1">// SQL Execution:</div>
                WHERE c.age BETWEEN 36 AND 45 GROUP BY c.job;
              </div>
            </div>

            {/* 3. SLICE */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">3. SLICE</h4>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  Manager Label: Focus on a Group
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Isolates a single dimension constraint while keeping other measures intact.
              </p>
              <div className="text-[11px] font-mono p-3 rounded-lg bg-slate-900 text-slate-200 overflow-x-auto">
                <div className="text-indigo-400 font-bold mb-1">// Python Function:</div>
                olap_slice(dimension="job", value="technician")<br />
                <div className="text-emerald-400 font-bold mt-2 mb-1">// SQL Execution:</div>
                WHERE c.job = 'technician';
              </div>
            </div>

            {/* 4. DICE */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">4. DICE</h4>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  Manager Label: Compare Customer Groups
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Filters on multiple dimension conditions simultaneously (sub-cube extraction).
              </p>
              <div className="text-[11px] font-mono p-3 rounded-lg bg-slate-900 text-slate-200 overflow-x-auto">
                <div className="text-indigo-400 font-bold mb-1">// Python Function:</div>
                {"olap_dice(filters={'age_group': '26-35', 'contact': 'cellular', 'poutcome': 'success'})"}<br />
                <div className="text-emerald-400 font-bold mt-2 mb-1">// SQL Execution:</div>
                WHERE c.age BETWEEN 26 AND 35 AND ct.contact = 'cellular' AND h.poutcome = 'success';
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION: PYTHON IMPLEMENTATION (When clicked on Python Implementation tab) ── */}
      {activeTab === 'python-impl' && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Backend Python Codebase Inventory
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Technical implementation files and responsibilities.
          </p>

          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">backend/train_and_save.py</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Loads raw CSV, drops 12 duplicates, builds stratified 80/20 train/test split, fits ColumnTransformer (StandardScaler + OneHotEncoder), applies SMOTE (sampling_strategy=0.5), trains XGBClassifier (200 trees, depth 5, lr 0.05), evaluates metrics (accuracy, precision, recall, F1, AUC), and saves model/xgb_model.pkl &amp; model/preprocessor.pkl via joblib.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">backend/etl/build_warehouse.py</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Implements the complete ETL pipeline. Extracts raw CSV, transforms unique dimension combinations and assigns surrogate keys, creates Star Schema SQLite tables with PRAGMA foreign_keys = ON, loads fact &amp; dimension tables, builds B-tree indexes, and validates referential integrity.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">backend/warehouse/warehouse_service.py</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Implements the SQL analytical layer. Connects to bank_warehouse.db with Row factory, provides parameterized filter builders, and implements olap_rollup(), olap_drilldown(), olap_slice(), olap_dice(), and get_historical_context().
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">backend/app.py</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Flask web application exposing /health, /predict, /api/warehouse/summary, /api/warehouse/olap/rollup, /api/warehouse/olap/drilldown, /api/warehouse/olap/slice, /api/warehouse/olap/dice, and /api/warehouse/tables with CORS enabled.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION: ETL PIPELINE (When clicked on ETL Pipeline tab) ── */}
      {activeTab === 'etl-process' && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              ETL Pipeline Details
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h4 className="font-bold text-amber-600 mb-1">1. Extract</h4>
              <p className="text-slate-600 dark:text-slate-400">Reads semicolon-separated UCI CSV file into Pandas DataFrame. Validates candidate locations.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h4 className="font-bold text-blue-600 mb-1">2. Transform</h4>
              <p className="text-slate-600 dark:text-slate-400">Isolates dimensions (dim_contact, dim_campaign_history, dim_market), generates surrogate integer keys, and constructs fact_campaign.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h4 className="font-bold text-emerald-600 mb-1">3. Load</h4>
              <p className="text-slate-600 dark:text-slate-400">Creates SQLite schema with foreign keys enforced, loads tables via df.to_sql(), builds 5 indexes, and checks for 0 orphan rows.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION: BACKEND / API (When clicked on Backend/API tab) ── */}
      {activeTab === 'backend-api' && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Backend REST API Endpoints
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 text-left">Method</th>
                  <th className="py-2.5 px-3 text-left">Endpoint Route</th>
                  <th className="py-2.5 px-3 text-left">Source Function</th>
                  <th className="py-2.5 px-3 text-left">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                <tr>
                  <td className="py-2.5 px-3"><span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">GET</span></td>
                  <td className="py-2.5 px-3 font-bold">/health</td>
                  <td className="py-2.5 px-3 text-indigo-500">health()</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">Backend health status &amp; model load check.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3"><span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">POST</span></td>
                  <td className="py-2.5 px-3 font-bold">/predict</td>
                  <td className="py-2.5 px-3 text-indigo-500">predict()</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">XGBoost ML prediction &amp; historical base rates.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3"><span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">GET</span></td>
                  <td className="py-2.5 px-3 font-bold">/api/warehouse/summary</td>
                  <td className="py-2.5 px-3 text-indigo-500">warehouse_summary()</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">Warehouse KPIs and dimension aggregations.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3"><span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">GET</span></td>
                  <td className="py-2.5 px-3 font-bold">/api/warehouse/olap/rollup</td>
                  <td className="py-2.5 px-3 text-indigo-500">warehouse_rollup()</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">OLAP Roll-Up aggregation on specified dimension.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3"><span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">GET</span></td>
                  <td className="py-2.5 px-3 font-bold">/api/warehouse/olap/drilldown</td>
                  <td className="py-2.5 px-3 text-indigo-500">warehouse_drilldown()</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">OLAP Drill-Down from parent to child dimension.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3"><span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">GET</span></td>
                  <td className="py-2.5 px-3 font-bold">/api/warehouse/olap/slice</td>
                  <td className="py-2.5 px-3 text-indigo-500">warehouse_slice()</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">OLAP Slice with single dimension constraint.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3"><span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-bold">POST</span></td>
                  <td className="py-2.5 px-3 font-bold">/api/warehouse/olap/dice</td>
                  <td className="py-2.5 px-3 text-indigo-500">warehouse_dice()</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">OLAP Dice filtering multiple dimensions simultaneously.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3"><span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">GET</span></td>
                  <td className="py-2.5 px-3 font-bold">/api/warehouse/tables</td>
                  <td className="py-2.5 px-3 text-indigo-500">warehouse_tables()</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">Database schema metadata, row counts, and PK/FKs.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SECTION: SYSTEM ARCHITECTURE (When clicked on System Architecture tab) ── */}
      {activeTab === 'architecture' && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              System Architecture (4-Tier Design)
            </h3>
          </div>
          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-[10px] font-bold text-amber-500 uppercase">Tier 1: Data Storage Layer</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-bold mt-0.5">Raw CSV + SQLite Data Warehouse (bank_warehouse.db)</p>
              <p className="text-xs text-slate-500">5 relational tables enforcing foreign keys and indexing 41,188 fact records.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-[10px] font-bold text-indigo-500 uppercase">Tier 2: Computing &amp; Analytics Layer</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-bold mt-0.5">Python ETL, OLAP Service &amp; XGBoost Inference Engine</p>
              <p className="text-xs text-slate-500">Extracts, transforms, executes parameterized SQL OLAP queries, and runs model predictions.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-[10px] font-bold text-blue-500 uppercase">Tier 3: REST API Layer</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-bold mt-0.5">Flask Microservice (Port 5000)</p>
              <p className="text-xs text-slate-500">Serves predictions, warehouse aggregations, and empirical historical context with CORS.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-[10px] font-bold text-emerald-500 uppercase">Tier 4: Presentation Layer</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-bold mt-0.5">React 18 + Vite + TypeScript Single Page Application</p>
              <p className="text-xs text-slate-500">Role-separated interfaces: Bank Manager (business decision support) and System Administrator (technical evaluation).</p>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION: PROJECT INFORMATION & TECHNICAL SPECIFICATIONS (When clicked on Project Information tab) ── */}
      {activeTab === 'project-map' && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Project Information &amp; Technical Specifications
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Core specifications, repository structure, and technology stack powering the Bank Campaign Intelligence system.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">System Information</span>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-sans">System Title:</span>
                  <span className="font-bold text-slate-900 dark:text-white">Bank Campaign Intelligence</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-sans">Domain:</span>
                  <span className="font-bold text-slate-900 dark:text-white">Banking Term Deposit Marketing</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-sans">Target Dataset:</span>
                  <span className="text-indigo-500">UCI Bank Marketing (41,188 rows)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">Repository:</span>
                  <span className="text-slate-700 dark:text-slate-300">Bank_Campaign_Intelligence</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Technology Stack</span>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-sans">ML Engine:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">XGBoost + Scikit-Learn</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-sans">Class Balancing:</span>
                  <span className="font-bold text-amber-600">imbalanced-learn SMOTE</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-sans">Data Warehouse:</span>
                  <span className="text-indigo-500">SQLite3 (Star Schema)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">Backend &amp; UI:</span>
                  <span className="text-slate-700 dark:text-slate-300">Flask (Py) + React 18 / Vite (TS)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Module Responsibility Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="font-mono text-indigo-500 font-bold">backend/train_and_save.py</span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">
                  Machine learning model training, preprocessing pipeline, SMOTE balancing, metric evaluation, and artifact serialization.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="font-mono text-blue-500 font-bold">backend/etl/build_warehouse.py</span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">
                  ETL process converting flat raw CSV data into 5 normalized Star Schema tables with foreign key indexing.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="font-mono text-purple-500 font-bold">backend/warehouse/warehouse_service.py</span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">
                  OLAP engine providing parameterized SQL execution for Roll-Up, Drill-Down, Slice, and Dice operations.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="font-mono text-amber-500 font-bold">backend/app.py</span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">
                  Flask REST microservice exposing /predict, /health, and OLAP analytics routes to client applications.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
