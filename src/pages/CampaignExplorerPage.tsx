import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  ZoomIn,
  Focus,
  SlidersHorizontal,
  RotateCcw,
  ArrowRight,
  Database,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import {
  fetchOlapRollup,
  fetchOlapDrilldown,
  fetchOlapDice,
} from '../utils/api';
import { DrillDimension, ExplorerFilters, OlapRow, DashboardAnalyticsResponse } from '../types';
import { useTheme } from '../context/ThemeContext';

// Label Maps
const JOB_LABELS: Record<string, string> = {
  'student': 'Student',
  'retired': 'Retired',
  'unemployed': 'Unemployed',
  'admin.': 'Admin / Office',
  'management': 'Management',
  'unknown': 'Unknown',
  'technician': 'Technician',
  'self-employed': 'Self-Employed',
  'housemaid': 'Housemaid',
  'entrepreneur': 'Entrepreneur',
  'services': 'Services',
  'blue-collar': 'Blue-Collar',
};

const POUTCOME_LABELS: Record<string, string> = {
  'success': 'Successful',
  'failure': 'Unsuccessful',
  'nonexistent': 'No Previous Contact',
};

const CONTACT_LABELS: Record<string, string> = {
  'cellular': 'Cellular (Mobile)',
  'telephone': 'Telephone (Landline)',
};

function barColor(rate: number, isDark: boolean) {
  if (rate >= 25) return isDark ? '#10b981' : '#059669';
  if (rate >= 14) return isDark ? '#38bdf8' : '#0284c7';
  if (rate >= 8) return isDark ? '#fbbf24' : '#d97706';
  return isDark ? '#64748b' : '#94a3b8';
}

function formatGroupLabel(dim: string, key: string): string {
  if (dim === 'occupation' || dim === 'job') return JOB_LABELS[key] ?? key;
  if (dim === 'previous_result' || dim === 'previousResult' || dim === 'poutcome') return POUTCOME_LABELS[key] ?? key;
  if (dim === 'contact_method' || dim === 'contactMethod' || dim === 'contact') return CONTACT_LABELS[key] ?? key;
  return key;
}

const DIMENSIONS: { id: DrillDimension; apiDim: string; label: string }[] = [
  { id: 'ageGroup', apiDim: 'age_group', label: 'Age Group' },
  { id: 'occupation', apiDim: 'occupation', label: 'Occupation' },
  { id: 'contactMethod', apiDim: 'contact_method', label: 'Contact Method' },
  { id: 'previousResult', apiDim: 'previous_result', label: 'Previous Result' },
  { id: 'overall', apiDim: 'overall', label: 'Overall Campaign' },
];

export const CampaignExplorerPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartTooltipStyle = {
    backgroundColor: isDark ? '#172033' : '#ffffff',
    borderColor: isDark ? '#263247' : '#e2e8f0',
    borderRadius: '8px',
    fontSize: '12px',
    color: isDark ? '#F8FAFC' : '#1e293b',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  };

  const gridStroke = isDark ? '#1e293b' : '#f1f5f9';
  const axisTickColor = isDark ? '#94a3b8' : '#475569';

  // Navigation / Tab state: 'rollup' | 'drilldown' | 'slice_dice'
  const [activeTab, setActiveTab] = useState<'rollup' | 'drilldown' | 'slice_dice'>('rollup');

  // Roll-Up state (Campaign Summary)
  const [selectedDimension, setSelectedDimension] = useState<DrillDimension>('ageGroup');
  const [rollupData, setRollupData] = useState<OlapRow[]>([]);
  const [loadingRollup, setLoadingRollup] = useState<boolean>(false);

  // Drill-Down state (Explore Performance)
  const [drillHierarchy, setDrillHierarchy] = useState<{
    parentDim: string;
    parentVal: string;
    drillDim: string;
  }>({
    parentDim: 'age_group',
    parentVal: '36-45',
    drillDim: 'occupation',
  });
  const [drillData, setDrillData] = useState<OlapRow[]>([]);
  const [loadingDrill, setLoadingDrill] = useState<boolean>(false);

  // Slice & Dice state (Focus on a Group / Compare Customer Groups)
  const [diceFilters, setDiceFilters] = useState<ExplorerFilters>({
    ageGroup: null,
    occupation: null,
    contactMethod: null,
    previousResult: null,
  });
  const [diceResult, setDiceResult] = useState<DashboardAnalyticsResponse | null>(null);
  const [loadingDice, setLoadingDice] = useState<boolean>(false);

  // Load Roll-Up data
  const loadRollup = useCallback(async (dim: DrillDimension) => {
    setLoadingRollup(true);
    try {
      const apiDim = DIMENSIONS.find((d) => d.id === dim)?.apiDim ?? 'age_group';
      const rows = await fetchOlapRollup(apiDim);
      setRollupData(rows);
    } catch (err) {
      console.error('Failed to load roll-up:', err);
    } finally {
      setLoadingRollup(false);
    }
  }, []);

  // Load Drill-Down data
  const loadDrilldown = useCallback(async (parentDim: string, parentVal: string, drillDim: string) => {
    setLoadingDrill(true);
    try {
      const rows = await fetchOlapDrilldown(parentDim, parentVal, drillDim);
      setDrillData(rows);
    } catch (err) {
      console.error('Failed to load drill-down:', err);
    } finally {
      setLoadingDrill(false);
    }
  }, []);

  // Load Dice/Slice data
  const loadDice = useCallback(async (filters: ExplorerFilters) => {
    setLoadingDice(true);
    try {
      const payload: Record<string, string> = {};
      if (filters.ageGroup) payload.age_group = filters.ageGroup;
      if (filters.occupation) payload.job = filters.occupation;
      if (filters.contactMethod) payload.contact = filters.contactMethod;
      if (filters.previousResult) payload.poutcome = filters.previousResult;

      const result = await fetchOlapDice(payload);
      setDiceResult(result);
    } catch (err) {
      console.error('Failed to load dice:', err);
    } finally {
      setLoadingDice(false);
    }
  }, []);

  useEffect(() => {
    loadRollup(selectedDimension);
  }, [selectedDimension, loadRollup]);

  useEffect(() => {
    loadDrilldown(drillHierarchy.parentDim, drillHierarchy.parentVal, drillHierarchy.drillDim);
  }, [drillHierarchy, loadDrilldown]);

  useEffect(() => {
    loadDice(diceFilters);
  }, [diceFilters, loadDice]);

  const handleStartDrill = (parentDim: string, parentVal: string, drillDim: string) => {
    setDrillHierarchy({ parentDim, parentVal, drillDim });
    setActiveTab('drilldown');
  };

  const activeFilterCount = Object.values(diceFilters).filter(Boolean).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#172033] rounded-xl border border-slate-200 dark:border-[#263247] p-5 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 mb-1">
              <Database className="w-3.5 h-3.5" /> Campaign Analysis
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">Campaign Analysis</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Explore campaign performance across different customer groups.
            </p>
          </div>
        </div>

        {/* 4 Operations Visual Guide */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-[#263247]">
          {/* Campaign Summary */}
          <div
            onClick={() => setActiveTab('rollup')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              activeTab === 'rollup'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-500/20'
                : 'bg-slate-50/70 dark:bg-[#111827]/70 border-slate-200 dark:border-[#263247] hover:bg-slate-100 dark:hover:bg-[#111827]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Campaign Summary</p>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">See overall campaign performance.</p>
          </div>

          {/* Explore Performance */}
          <div
            onClick={() => setActiveTab('drilldown')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              activeTab === 'drilldown'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-500/20'
                : 'bg-slate-50/70 dark:bg-[#111827]/70 border-slate-200 dark:border-[#263247] hover:bg-slate-100 dark:hover:bg-[#111827]'
            }`}
          >
            <div className="flex items-center gap-2">
              <ZoomIn className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Explore Performance</p>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Explore campaign results in more detail.</p>
          </div>

          {/* Focus on a Group */}
          <div
            onClick={() => setActiveTab('slice_dice')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              activeTab === 'slice_dice' && activeFilterCount === 1
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-500/20'
                : 'bg-slate-50/70 dark:bg-[#111827]/70 border-slate-200 dark:border-[#263247] hover:bg-slate-100 dark:hover:bg-[#111827]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Focus className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Focus on a Group</p>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">View results for one selected customer group.</p>
          </div>

          {/* Compare Customer Groups */}
          <div
            onClick={() => setActiveTab('slice_dice')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              activeTab === 'slice_dice' && activeFilterCount > 1
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-500/20'
                : 'bg-slate-50/70 dark:bg-[#111827]/70 border-slate-200 dark:border-[#263247] hover:bg-slate-100 dark:hover:bg-[#111827]'
            }`}
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Compare Customer Groups</p>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Compare campaign results across multiple groups.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-[#263247]">
        <button
          onClick={() => setActiveTab('rollup')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'rollup'
              ? 'border-indigo-600 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" /> Campaign Summary
        </button>

        <button
          onClick={() => setActiveTab('drilldown')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'drilldown'
              ? 'border-indigo-600 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ZoomIn className="w-4 h-4" /> Explore Performance
        </button>

        <button
          onClick={() => setActiveTab('slice_dice')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'slice_dice'
              ? 'border-indigo-600 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilterCount <= 1 ? 'Focus on a Group' : 'Compare Customer Groups'}
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ─── TAB 1: CAMPAIGN SUMMARY (Roll-Up) ──────────────────────────────── */}
      {activeTab === 'rollup' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#172033] p-4 rounded-xl border border-slate-200 dark:border-[#263247] transition-colors">
            <div>
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">Summary View</span>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">See overall campaign performance</h2>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">View Results By:</label>
              <select
                value={selectedDimension}
                onChange={(e) => setSelectedDimension(e.target.value as DrillDimension)}
                className="text-xs bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#263247] rounded-lg p-2 font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {DIMENSIONS.map((dim) => (
                  <option key={dim.id} value={dim.id}>
                    {dim.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white dark:bg-[#172033] rounded-xl border border-slate-200 dark:border-[#263247] p-5 shadow-sm transition-colors">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">
              Customer Response by {DIMENSIONS.find((d) => d.id === selectedDimension)?.label}
            </h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rollupData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis
                    dataKey="group_name"
                    tickFormatter={(v) => formatGroupLabel(selectedDimension, v)}
                    tick={{ fontSize: 11, fill: axisTickColor }}
                  />
                  <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: axisTickColor }} />
                  <Tooltip
                    formatter={(v: any) => [`${v}%`, 'Response Rate']}
                    labelFormatter={(l) => formatGroupLabel(selectedDimension, String(l))}
                    contentStyle={chartTooltipStyle}
                  />
                  <Bar dataKey="response_rate" radius={[6, 6, 0, 0]}>
                    {rollupData.map((row, idx) => (
                      <Cell key={idx} fill={barColor(row.response_rate, isDark)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white dark:bg-[#172033] rounded-xl border border-slate-200 dark:border-[#263247] overflow-hidden shadow-sm transition-colors">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-[#263247] bg-slate-50 dark:bg-[#111827] flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                Campaign Summary Table (Click row to Explore Performance)
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{rollupData.length} groups analyzed</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/50 dark:bg-[#111827]/50 border-b border-slate-200 dark:border-[#263247] text-xs text-slate-600 dark:text-slate-400 uppercase">
                  <tr>
                    <th className="text-left px-5 py-3 font-bold">Group / Dimension Member</th>
                    <th className="text-right px-5 py-3 font-bold">Total Contacts</th>
                    <th className="text-right px-5 py-3 font-bold">Interested (Yes)</th>
                    <th className="text-right px-5 py-3 font-bold">Response Rate</th>
                    <th className="text-right px-5 py-3 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#263247]">
                  {rollupData.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer"
                      onClick={() => handleStartDrill(selectedDimension, row.group_name, 'occupation')}
                    >
                      <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-200">
                        {formatGroupLabel(selectedDimension, row.group_name)}
                      </td>
                      <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-400">{row.total.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right text-emerald-700 dark:text-emerald-400 font-semibold">
                        {row.yes.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-slate-800 dark:text-slate-100">
                        {row.response_rate}%
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                          Explore Performance <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: EXPLORE PERFORMANCE (Drill-Down) ────────────────────────── */}
      {activeTab === 'drilldown' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#172033] p-5 rounded-xl border border-slate-200 dark:border-[#263247] shadow-sm space-y-4 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wide">
                  Explore Performance
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {drillHierarchy.parentDim === 'age_group' ? 'Age Group' : drillHierarchy.parentDim}:{' '}
                  <span className="text-sky-600 dark:text-sky-400">{drillHierarchy.parentVal}</span> &rarr; Breakdown by{' '}
                  <span className="text-indigo-600 dark:text-indigo-400">{drillHierarchy.drillDim}</span>
                </h2>
              </div>
            </div>

            {/* Drilldown Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-[#263247]">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Parent Dimension</label>
                <select
                  value={drillHierarchy.parentDim}
                  onChange={(e) =>
                    setDrillHierarchy((prev) => ({
                      ...prev,
                      parentDim: e.target.value,
                      parentVal: e.target.value === 'age_group' ? '36-45' : 'admin.',
                    }))
                  }
                  className="w-full text-xs bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#263247] rounded-lg p-2 font-medium text-slate-800 dark:text-slate-200"
                >
                  <option value="age_group">Age Group</option>
                  <option value="occupation">Occupation</option>
                  <option value="contact_method">Contact Method</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Parent Value</label>
                {drillHierarchy.parentDim === 'age_group' ? (
                  <select
                    value={drillHierarchy.parentVal}
                    onChange={(e) => setDrillHierarchy((prev) => ({ ...prev, parentVal: e.target.value }))}
                    className="w-full text-xs bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#263247] rounded-lg p-2 font-medium text-slate-800 dark:text-slate-200"
                  >
                    <option value="18-25">18–25</option>
                    <option value="26-35">26–35</option>
                    <option value="36-45">36–45</option>
                    <option value="46-55">46–55</option>
                    <option value="56-65">56–65</option>
                    <option value="66+">66+</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={drillHierarchy.parentVal}
                    onChange={(e) => setDrillHierarchy((prev) => ({ ...prev, parentVal: e.target.value }))}
                    className="w-full text-xs bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#263247] rounded-lg p-2 font-medium text-slate-800 dark:text-slate-200"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Drill Dimension</label>
                <select
                  value={drillHierarchy.drillDim}
                  onChange={(e) => setDrillHierarchy((prev) => ({ ...prev, drillDim: e.target.value }))}
                  className="w-full text-xs bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#263247] rounded-lg p-2 font-medium text-slate-800 dark:text-slate-200"
                >
                  <option value="occupation">Occupation</option>
                  <option value="contact_method">Contact Method</option>
                  <option value="previous_result">Previous Outcome</option>
                </select>
              </div>
            </div>
          </div>

          {/* Drilldown Chart */}
          <div className="bg-white dark:bg-[#172033] rounded-xl border border-slate-200 dark:border-[#263247] p-5 shadow-sm transition-colors">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">
              Detailed Breakdown: {drillHierarchy.parentVal} &rarr; {drillHierarchy.drillDim}
            </h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={drillData} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis
                    dataKey="group_name"
                    tickFormatter={(v) => formatGroupLabel(drillHierarchy.drillDim, v)}
                    angle={-25}
                    textAnchor="end"
                    tick={{ fontSize: 10, fill: axisTickColor }}
                  />
                  <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: axisTickColor }} />
                  <Tooltip
                    formatter={(v: any) => [`${v}%`, 'Response Rate']}
                    labelFormatter={(l) => formatGroupLabel(drillHierarchy.drillDim, String(l))}
                    contentStyle={chartTooltipStyle}
                  />
                  <Bar dataKey="response_rate" radius={[6, 6, 0, 0]}>
                    {drillData.map((row, idx) => (
                      <Cell key={idx} fill={barColor(row.response_rate, isDark)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Drilldown Table */}
          <div className="bg-white dark:bg-[#172033] rounded-xl border border-slate-200 dark:border-[#263247] overflow-hidden shadow-sm transition-colors">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-[#263247] bg-slate-50 dark:bg-[#111827]">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                Detailed Performance Breakdown Records
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/50 dark:bg-[#111827]/50 border-b border-slate-200 dark:border-[#263247] text-xs text-slate-600 dark:text-slate-400 uppercase">
                  <tr>
                    <th className="text-left px-5 py-3 font-bold">Sub-Group</th>
                    <th className="text-right px-5 py-3 font-bold">Total Contacts</th>
                    <th className="text-right px-5 py-3 font-bold">Interested (Yes)</th>
                    <th className="text-right px-5 py-3 font-bold">Response Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#263247]">
                  {drillData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-[#111827]">
                      <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-200">
                        {formatGroupLabel(drillHierarchy.drillDim, row.group_name)}
                      </td>
                      <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-400">{row.total.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right text-emerald-700 dark:text-emerald-400 font-semibold">
                        {row.yes.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-slate-800 dark:text-slate-100">
                        {row.response_rate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: FOCUS ON A GROUP / COMPARE CUSTOMER GROUPS (Slice/Dice) ─── */}
      {activeTab === 'slice_dice' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#172033] p-5 rounded-xl border border-slate-200 dark:border-[#263247] shadow-sm space-y-4 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
                  {activeFilterCount <= 1 ? 'Focus on a Group (1 Filter)' : 'Compare Customer Groups (Multi-Filter)'}
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Select Customer Segment Filters
                </h2>
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={() =>
                    setDiceFilters({
                      ageGroup: null,
                      occupation: null,
                      contactMethod: null,
                      previousResult: null,
                    })
                  }
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear All Filters
                </button>
              )}
            </div>

            {/* Filter selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-[#263247]">
              {/* Age Group */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Age Group</label>
                <select
                  value={diceFilters.ageGroup || ''}
                  onChange={(e) =>
                    setDiceFilters((prev) => ({ ...prev, ageGroup: e.target.value || null }))
                  }
                  className="w-full text-xs bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#263247] rounded-lg p-2 font-medium text-slate-800 dark:text-slate-200"
                >
                  <option value="">All Ages (Unfiltered)</option>
                  <option value="18-25">18–25</option>
                  <option value="26-35">26–35</option>
                  <option value="36-45">36–45</option>
                  <option value="46-55">46–55</option>
                  <option value="56-65">56–65</option>
                  <option value="66+">66+</option>
                </select>
              </div>

              {/* Occupation */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Occupation</label>
                <select
                  value={diceFilters.occupation || ''}
                  onChange={(e) =>
                    setDiceFilters((prev) => ({ ...prev, occupation: e.target.value || null }))
                  }
                  className="w-full text-xs bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#263247] rounded-lg p-2 font-medium text-slate-800 dark:text-slate-200"
                >
                  <option value="">All Occupations</option>
                  <option value="admin.">Admin / Office</option>
                  <option value="blue-collar">Blue-Collar</option>
                  <option value="technician">Technician</option>
                  <option value="services">Services</option>
                  <option value="management">Management</option>
                  <option value="retired">Retired</option>
                  <option value="student">Student</option>
                  <option value="self-employed">Self-Employed</option>
                  <option value="entrepreneur">Entrepreneur</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="housemaid">Housemaid</option>
                </select>
              </div>

              {/* Contact Method */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Contact Method</label>
                <select
                  value={diceFilters.contactMethod || ''}
                  onChange={(e) =>
                    setDiceFilters((prev) => ({ ...prev, contactMethod: e.target.value || null }))
                  }
                  className="w-full text-xs bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#263247] rounded-lg p-2 font-medium text-slate-800 dark:text-slate-200"
                >
                  <option value="">All Methods</option>
                  <option value="cellular">Cellular</option>
                  <option value="telephone">Telephone</option>
                </select>
              </div>

              {/* Previous Result */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Previous Result</label>
                <select
                  value={diceFilters.previousResult || ''}
                  onChange={(e) =>
                    setDiceFilters((prev) => ({ ...prev, previousResult: e.target.value || null }))
                  }
                  className="w-full text-xs bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#263247] rounded-lg p-2 font-medium text-slate-800 dark:text-slate-200"
                >
                  <option value="">All Outcomes</option>
                  <option value="success">Successful</option>
                  <option value="failure">Unsuccessful</option>
                  <option value="nonexistent">No Previous Contact</option>
                </select>
              </div>
            </div>
          </div>

          {/* Diced KPI cards */}
          {diceResult && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#172033] p-4 rounded-xl border border-slate-200 dark:border-[#263247] shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Segment Contacts
                </span>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
                  {diceResult.kpis.total_records.toLocaleString()}
                </p>
                <span className="text-xs text-slate-500 dark:text-slate-400">Contacts analyzed</span>
              </div>

              <div className="bg-white dark:bg-[#172033] p-4 rounded-xl border border-slate-200 dark:border-[#263247] shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Customers Showing Interest
                </span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {diceResult.kpis.positive_responses.toLocaleString()}
                </p>
                <span className="text-xs text-slate-500 dark:text-slate-400">Subscribed customers</span>
              </div>

              <div className="bg-white dark:bg-[#172033] p-4 rounded-xl border border-slate-200 dark:border-[#263247] shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Response Rate
                </span>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  {diceResult.kpis.response_rate}%
                </p>
                <span className="text-xs text-slate-500 dark:text-slate-400">Success percentage</span>
              </div>

              <div className="bg-white dark:bg-[#172033] p-4 rounded-xl border border-slate-200 dark:border-[#263247] shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Average Call Duration
                </span>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {diceResult.kpis.avg_duration}s
                </p>
                <span className="text-xs text-slate-500 dark:text-slate-400">Contact duration in seconds</span>
              </div>
            </div>
          )}

          {/* Segment Narrative */}
          {diceResult && (
            <div className="bg-slate-50 dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#263247] p-5">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
                Segment Narrative
              </h3>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                {diceResult.campaign_story.summary_text}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CampaignExplorerPage;
