import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Layers,
  ZoomIn,
  Focus,
  SlidersHorizontal,
  Database,
  AlertTriangle,
  Info,
  Table,
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
} from 'recharts';
import {
  MODELS_BEFORE_SMOTE,
  MODELS_AFTER_SMOTE,
  XGBOOST_FINAL_METRICS,
  XGBOOST_CONFUSION_MATRIX,
  TOP_10_FEATURES,
} from '../data/modelMetrics';
import { fetchWarehouseTables, fetchTableSample } from '../utils/api';
import { WarehouseSchemaResponse, WarehouseTableSample } from '../types';
import { useTheme } from '../context/ThemeContext';

function MetricPill({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#263247] shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`text-2xl font-black font-mono mt-1 ${color ?? 'text-slate-900 dark:text-slate-100'}`}>{value}</p>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-[#172033] rounded-xl border border-slate-200 dark:border-[#263247] shadow-sm overflow-hidden transition-colors">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-[#263247] bg-slate-50/50 dark:bg-[#111827]/50">
        <h3 className="font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export const TechnicalDetailsPage: React.FC = () => {
  const [smoteMode, setSmoteMode] = useState<boolean>(true);
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

  // Live Warehouse schema and sample states
  const [schema, setSchema] = useState<WarehouseSchemaResponse | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>('fact_campaign');
  const [tableSample, setTableSample] = useState<WarehouseTableSample | null>(null);
  const [loadingSample, setLoadingSample] = useState<boolean>(false);

  useEffect(() => {
    fetchWarehouseTables()
      .then((data) => setSchema(data))
      .catch((err) => console.error('Failed to fetch schema metadata:', err));
  }, []);

  useEffect(() => {
    if (selectedTable) {
      setLoadingSample(true);
      fetchTableSample(selectedTable, 5)
        .then((sample) => setTableSample(sample))
        .catch((err) => console.error(`Failed to fetch sample for ${selectedTable}:`, err))
        .finally(() => setLoadingSample(false));
    }
  }, [selectedTable]);

  const currentModels = smoteMode ? MODELS_AFTER_SMOTE : MODELS_BEFORE_SMOTE;
  const modelChartData = currentModels.map((m) => ({
    name: m.model,
    Accuracy: +(m.accuracy * 100).toFixed(1),
    Precision: +(m.precision * 100).toFixed(1),
    Recall: +(m.recall * 100).toFixed(1),
    'F1 Score': +(m.f1 * 100).toFixed(1),
  }));

  const { tn, fp, fn, tp } = XGBOOST_CONFUSION_MATRIX;

  return (
    <div className="space-y-8 pb-12">
      {/* Technical Reference Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 dark:from-[#111827] dark:to-[#172033] rounded-2xl p-6 text-white shadow-sm border border-slate-800 dark:border-[#263247]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-white">DWM &amp; Machine Learning Architecture Reference</h2>
            <p className="text-sm text-slate-300">Technical documentation, Star Schema specifications, and model evaluation metrics</p>
          </div>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          This page documents the complete <strong>Data Warehousing &amp; Data Mining (DWM)</strong> implementation:
          ETL pipeline, SQLite Star Schema data warehouse, SQL-based OLAP operations, and the XGBoost classification model.
        </p>
      </div>

      {/* ── MANAGER UI TO DWM CONCEPT MAPPING MATRIX ────────────────────── */}
      <SectionCard
        title="UI Label to DWM Concept Mapping Matrix"
        subtitle="Demonstrates how manager-friendly UI labels map directly to underlying DWM &amp; OLAP concepts"
      >
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#263247]">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide">Manager-Facing UI Label</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide">DWM / OLAP Operation</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide">Technical Concept</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide">SQL Execution Mechanics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#263247]">
              {[
                {
                  friendly: 'Campaign Summary',
                  olap: 'OLAP Roll-Up',
                  concept: 'Roll-Up',
                  icon: <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
                  desc: 'Executes SQL SUM/COUNT aggregation with GROUP BY across a high-level dimension table.',
                },
                {
                  friendly: 'Explore Performance',
                  olap: 'OLAP Drill-Down',
                  concept: 'Drill-Down',
                  icon: <ZoomIn className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
                  desc: 'Navigates down dimension hierarchies into lower-level granularities using SQL sub-grouping.',
                },
                {
                  friendly: 'Focus on a Group',
                  olap: 'OLAP Slice',
                  concept: 'Slice',
                  icon: <Focus className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
                  desc: 'Fixes a single dimension constraint (e.g. Age Group = 36–45) via a single-table WHERE clause.',
                },
                {
                  friendly: 'Compare Customer Groups',
                  olap: 'OLAP Dice',
                  concept: 'Dice',
                  icon: <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
                  desc: 'Applies multiple simultaneous dimension filters using composite SQL JOINs and WHERE clauses.',
                },
              ].map((row) => (
                <tr key={row.friendly} className="hover:bg-slate-50 dark:hover:bg-[#111827]">
                  <td className="px-4 py-3 font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                    {row.icon} {row.friendly}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{row.olap}</td>
                  <td className="px-4 py-3">
                    <code className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold">
                      {row.concept}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── DWM ARCHITECTURE & STAR SCHEMA ─────────────────────────────── */}
      <SectionCard
        title="Data Warehouse Star Schema Architecture"
        subtitle="Dimensional modeling with 1 central fact table and 4 surrounding dimension tables in SQLite"
      >
        <div className="space-y-6">
          {/* Star Schema Diagram */}
          <div className="p-6 bg-slate-900 text-white rounded-xl font-mono text-xs overflow-x-auto shadow-inner border border-slate-800">
            <div className="text-center font-bold text-indigo-400 mb-4 tracking-wider uppercase text-sm">
              ★ Bank Campaign Warehouse Star Schema ★
            </div>
            <pre className="text-center text-slate-200 leading-relaxed">
{`                        ┌───────────────────────────────────────┐
                        │             DIM_CUSTOMER              │
                        ├───────────────────────────────────────┤
                        │ PK: customer_key (Surrogate)          │
                        │ age, job, marital, education,         │
                        │ default, housing, loan                │
                        └───────────────────┬───────────────────┘
                                            │
                                            │ FK: customer_key
                                            ▼
┌──────────────────────────────┐   ┌────────────────────────────────┐   ┌──────────────────────────────┐
│         DIM_CONTACT          │   │         FACT_CAMPAIGN          │   │     DIM_CAMPAIGN_HISTORY     │
├──────────────────────────────┤   ├────────────────────────────────┤   ├──────────────────────────────┤
│ PK: contact_key (Surrogate)  ├──►│ PK: record_key                 │◄──┤ PK: campaign_history_key     │
│ contact, month, day_of_week  │FK │ FK: customer_key               │FK │ previous, pdays, poutcome    │
└──────────────────────────────┘   │ FK: contact_key                │   └──────────────────────────────┘
                                   │ FK: campaign_history_key       │
                                   │ FK: market_key                 │
                                   ├────────────────────────────────┤
                                   │ Measures / Degenerate:         │
                                   │ campaign_contacts, duration    │
                                   │ response (yes/no)              │
                                   └────────────────┬───────────────┘
                                                    │
                                                    │ FK: market_key
                                                    ▼
                        ┌───────────────────────────────────────┐
                        │              DIM_MARKET               │
                        ├───────────────────────────────────────┤
                        │ PK: market_key (Surrogate)            │
                        │ emp_var_rate, cons_price_idx,         │
                        │ cons_conf_idx, euribor3m, nr_employed │
                        └───────────────────────────────────────┘`}
            </pre>
            <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap justify-between items-center text-[11px] text-slate-400">
              <span><strong>PK:</strong> Primary Key (Unique surrogate identifier)</span>
              <span><strong>FK:</strong> Foreign Key (Enforced via <code>PRAGMA foreign_keys = ON;</code>)</span>
              <span><strong>Database:</strong> SQLite <code>bank_warehouse.db</code></span>
            </div>
          </div>

          {/* ETL Pipeline Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-[#263247] bg-slate-50 dark:bg-[#111827]">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase">1. Extract</span>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">Raw CSV Source</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Reads 41,188 rows from <code>bank-additional-full.csv</code> (UCI Machine Learning Repository, semicolon delimited).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-[#263247] bg-slate-50 dark:bg-[#111827]">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase">2. Transform</span>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">Dimensional Normalization</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Generates surrogate keys for Customer (41,188 rows), Contact (100 rows), History (120 rows), and Market (375 rows).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-[#263247] bg-slate-50 dark:bg-[#111827]">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase">3. Load &amp; Index</span>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">Star Schema SQLite</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Populates <code>fact_campaign</code> with 41,188 records and builds B-Tree indexes on all foreign keys for fast OLAP joins.
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── LIVE DATA WAREHOUSE TABLES VIEWER ────────────────────────────── */}
      <SectionCard
        title="Live Data Warehouse Structure &amp; Table Inspector"
        subtitle="Inspect actual tables, schemas, keys, row counts, and live data records directly from bank_warehouse.db"
      >
        <div className="space-y-5">
          {/* Table Selector Tabs */}
          <div className="flex flex-wrap gap-2">
            {['fact_campaign', 'dim_customer', 'dim_contact', 'dim_campaign_history', 'dim_market'].map((tbl) => (
              <button
                key={tbl}
                onClick={() => setSelectedTable(tbl)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  selectedTable === tbl
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-[#111827] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#263247] hover:bg-slate-100 dark:hover:bg-[#172033]'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                {tbl}
                {schema?.tables[tbl] && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedTable === tbl ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {schema.tables[tbl].row_count.toLocaleString()} rows
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Table Schema Details */}
          {schema?.tables[selectedTable] && (
            <div className="p-4 bg-slate-50 dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#263247]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Table: <code>{selectedTable}</code>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Total records: <strong>{schema.tables[selectedTable].row_count.toLocaleString()}</strong> | Columns: {schema.tables[selectedTable].columns.length}
                  </p>
                </div>
                {schema.tables[selectedTable].foreign_keys.length > 0 && (
                  <div className="text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 rounded-lg">
                    {schema.tables[selectedTable].foreign_keys.length} Foreign Key Constraints Active
                  </div>
                )}
              </div>

              {/* Columns & Types */}
              <div className="flex flex-wrap gap-2">
                {schema.tables[selectedTable].columns.map((col) => (
                  <span
                    key={col.name}
                    className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md font-mono ${
                      col.pk
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold'
                        : 'bg-white dark:bg-[#172033] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#263247]'
                    }`}
                  >
                    {col.pk && <span className="text-[9px] bg-amber-500 text-white px-1 rounded">PK</span>}
                    {col.name}: <span className="text-slate-400 dark:text-slate-500 font-normal">{col.type}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sample Rows Viewer */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#263247]">
            <div className="px-4 py-2.5 bg-slate-100/70 dark:bg-[#111827]/70 border-b border-slate-200 dark:border-[#263247] flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Live Sample Records (First 5 Rows from SQLite)
              </span>
              {loadingSample && <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Loading sample…</span>}
            </div>
            {tableSample && (
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-[#111827] border-b border-slate-200 dark:border-[#263247] text-slate-600 dark:text-slate-400">
                  <tr>
                    {tableSample.columns.map((col) => (
                      <th key={col} className="text-left px-3.5 py-2.5 font-bold uppercase tracking-wider text-[10px]">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#263247] font-mono">
                  {tableSample.sample_rows.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-[#111827]">
                      {tableSample.columns.map((col) => (
                        <td key={col} className="px-3.5 py-2 text-slate-800 dark:text-slate-200 truncate max-w-xs">
                          {String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </SectionCard>

      {/* ── ACADEMIC DOCUMENTATION & GRAIN LIMITATIONS ─────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dataset Limitation: Customer Grain */}
        <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            Dataset Limitation: Customer Grain
          </div>
          <p className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed">
            The UCI Bank Marketing dataset does <strong>not</strong> contain a stable real-world customer ID across multiple campaign cycles.
            Therefore, <code>customer_key</code> in <code>dim_customer</code> is a generated surrogate key scoped to each campaign interaction record.
            The system strictly models each contact event without fabricating customer identity across longitudinal history.
          </p>
        </div>

        {/* Contact Duration Field Limitation */}
        <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-bold text-sm">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            Contact Duration Field (`duration`)
          </div>
          <p className="text-xs text-blue-950 dark:text-blue-200 leading-relaxed">
            The <code>duration</code> attribute represents call length in seconds and is only known <em>after</em> a call is completed.
            While highly valuable for retrospective campaign analysis and preserved in the benchmark XGBoost classifier,
            a true pre-call customer prioritization system in operational banking would exclude duration prior to dialing.
          </p>
        </div>
      </div>

      {/* ── MODEL COMPARISON & SMOTE ───────────────────────────────────── */}
      <SectionCard
        title="Model Comparison (Data Mining)"
        subtitle="Evaluation across 4 classifiers — Logistic Regression, Decision Tree, Random Forest, XGBoost"
      >
        <div className="flex justify-end mb-4">
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setSmoteMode(false)}
              className={`px-3 py-1 text-xs font-semibold rounded ${
                !smoteMode ? 'bg-white dark:bg-[#172033] text-slate-800 dark:text-slate-100 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Before SMOTE
            </button>
            <button
              onClick={() => setSmoteMode(true)}
              className={`px-3 py-1 text-xs font-semibold rounded ${
                smoteMode ? 'bg-white dark:bg-[#172033] text-indigo-700 dark:text-indigo-300 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              After SMOTE
            </button>
          </div>
        </div>

        <div className="h-[280px] w-full mb-5">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={modelChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#475569' }} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} />
              <Tooltip formatter={(v: any) => [`${v}%`]} contentStyle={chartTooltipStyle} />
              <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="Accuracy" fill={isDark ? '#64748b' : '#94a3b8'} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Precision" fill={isDark ? '#38bdf8' : '#0284c7'} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Recall" fill={isDark ? '#34d399' : '#10b981'} radius={[3, 3, 0, 0]} />
              <Bar dataKey="F1 Score" fill={isDark ? '#818cf8' : '#6366f1'} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#263247]">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 dark:bg-[#111827] border-b border-slate-200 dark:border-[#263247]">
              <tr>
                {['Model', 'Accuracy', 'Precision', 'Recall', 'F1 Score', 'AUC-ROC'].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide text-[10px]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#263247]">
              {currentModels.map((m) => (
                <tr key={m.model} className={`hover:bg-slate-50 dark:hover:bg-[#111827] ${m.model === 'XGBoost' ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''}`}>
                  <td className="px-4 py-2.5 font-semibold text-slate-800 dark:text-slate-200">
                    {m.model}
                    {m.model === 'XGBoost' && (
                      <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                        Selected
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 font-mono">{(m.accuracy * 100).toFixed(2)}%</td>
                  <td className="px-4 py-2.5 font-mono">{(m.precision * 100).toFixed(2)}%</td>
                  <td className="px-4 py-2.5 font-mono text-emerald-700 dark:text-emerald-400">{(m.recall * 100).toFixed(2)}%</td>
                  <td className="px-4 py-2.5 font-mono">{(m.f1 * 100).toFixed(2)}%</td>
                  <td className="px-4 py-2.5 font-mono">{m.auc?.toFixed(4) ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── XGBoost Final Model Details ───────────────────────────────── */}
      <SectionCard
        title="XGBoost — Final Model Evaluation"
        subtitle="XGBClassifier with 200 estimators, max depth 5, learning rate 0.05, post-SMOTE"
      >
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          <MetricPill label="Accuracy" value={`${(XGBOOST_FINAL_METRICS.accuracy * 100).toFixed(2)}%`} />
          <MetricPill label="Precision" value={`${(XGBOOST_FINAL_METRICS.precision * 100).toFixed(2)}%`} color="text-sky-700 dark:text-sky-400" />
          <MetricPill label="Recall" value={`${(XGBOOST_FINAL_METRICS.recall * 100).toFixed(2)}%`} color="text-emerald-700 dark:text-emerald-400" />
          <MetricPill label="F1 Score" value={`${(XGBOOST_FINAL_METRICS.f1 * 100).toFixed(2)}%`} color="text-indigo-700 dark:text-indigo-400" />
          <MetricPill label="AUC-ROC" value={XGBOOST_FINAL_METRICS.auc.toFixed(4)} color="text-amber-700 dark:text-amber-400" />
        </div>

        {/* Confusion Matrix */}
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Confusion Matrix — Test Set (8,236 rows)</h4>
        <div className="grid grid-cols-2 gap-2 max-w-xs mb-2">
          {[
            { label: 'True Negative (TN)', value: tn, color: 'bg-slate-50 dark:bg-[#111827] border-slate-200 dark:border-[#263247] text-slate-700 dark:text-slate-300' },
            { label: 'False Positive (FP)', value: fp, color: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300' },
            { label: 'False Negative (FN)', value: fn, color: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300' },
            { label: 'True Positive (TP)', value: tp, color: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' },
          ].map((cell) => (
            <div key={cell.label} className={`p-3 rounded-xl border text-center ${cell.color}`}>
              <p className="text-2xl font-black font-mono">{cell.value.toLocaleString()}</p>
              <p className="text-[10px] font-bold mt-0.5">{cell.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Evaluated on 8,236 test rows (20% stratified split)</p>
      </SectionCard>

      {/* ── Feature Importance ────────────────────────────────────────── */}
      <SectionCard title="Top 10 Feature Importance" subtitle="XGBoost feature gain scores">
        <div className="space-y-2.5">
          {TOP_10_FEATURES.map((f) => (
            <div key={f.feature} className="flex items-center gap-3">
              <div className="w-36 shrink-0 text-xs text-slate-600 dark:text-slate-400 font-medium truncate">{f.label}</div>
              <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 dark:bg-indigo-400"
                  style={{ width: `${(f.importance / 0.30) * 100}%` }}
                />
              </div>
              <div className="w-14 text-right font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                {(f.importance * 100).toFixed(2)}%
              </div>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                f.category === 'Call Details' ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300' :
                f.category === 'Economic' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' :
                f.category === 'Campaign History' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' :
                'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
              }`}>{f.category}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

export default TechnicalDetailsPage;
