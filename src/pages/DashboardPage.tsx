import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  TrendingUp,
  PhoneCall,
  UserCheck,
  Target,
  Sparkles,
  Filter,
  RotateCcw,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { KpiCard } from '../components/common/KpiCard';
import { ChartCard } from '../components/common/ChartCard';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { fetchWarehouseSummary } from '../utils/api';
import { DashboardAnalyticsResponse, DashboardFilters, ManagerNavigationItem } from '../types';
import { useTheme } from '../context/ThemeContext';

interface DashboardPageProps {
  onNavigate: (page: ManagerNavigationItem) => void;
}

const DEFAULT_FILTERS: DashboardFilters = {
  ageGroup: 'all',
  occupation: 'all',
  contactMethod: 'all',
  month: 'all',
  previousResult: 'all',
  campaignRange: 'all',
};

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

function getBarColor(rate: number, isDark: boolean) {
  if (rate >= 25) return isDark ? '#10b981' : '#059669';
  if (rate >= 15) return isDark ? '#38bdf8' : '#0284c7';
  if (rate >= 8) return isDark ? '#fbbf24' : '#d97706';
  return isDark ? '#64748b' : '#94a3b8';
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [data, setData] = useState<DashboardAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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

  const loadData = useCallback(async (currentFilters: DashboardFilters) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchWarehouseSummary(currentFilters);
      setData(result);
    } catch (err: any) {
      console.error('Failed to load warehouse dashboard analytics:', err);
      setError('Unable to connect to Data Warehouse service. Please ensure Flask backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(filters);
  }, [filters, loadData]);

  const handleFilterChange = (key: keyof DashboardFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const isFiltered = Object.values(filters).some((v) => v !== 'all');

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-[#111827] dark:via-[#172033] dark:to-[#111827] rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-slate-800 dark:border-[#263247]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 mb-2">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Campaign Data Ready
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Bank Campaign Decision Support System</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Real-time multi-dimensional campaign analytics and customer engagement patterns powered by the campaign data warehouse.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('explorer')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              Explore Performance <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('assessment')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all"
            >
              Assess Customer
            </button>
          </div>
        </div>
      </div>

      {/* Filter Campaign Data */}
      <div className="bg-white dark:bg-[#172033] rounded-xl border border-slate-200 dark:border-[#263247] p-5 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Filter Campaign Data</h2>
            {isFiltered && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Filters Active
              </span>
            )}
          </div>
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Age Group */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Age Group</label>
            <select
              value={filters.ageGroup}
              onChange={(e) => handleFilterChange('ageGroup', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#263247] rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">All Age Groups</option>
              <option value="18-25">18–25 years</option>
              <option value="26-35">26–35 years</option>
              <option value="36-45">36–45 years</option>
              <option value="46-55">46–55 years</option>
              <option value="56-65">56–65 years</option>
              <option value="66+">66+ years</option>
            </select>
          </div>

          {/* Occupation */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Occupation</label>
            <select
              value={filters.occupation}
              onChange={(e) => handleFilterChange('occupation', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#263247] rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">All Occupations</option>
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
              value={filters.contactMethod}
              onChange={(e) => handleFilterChange('contactMethod', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#263247] rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">All Contact Methods</option>
              <option value="cellular">Cellular (Mobile)</option>
              <option value="telephone">Telephone (Landline)</option>
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Campaign Month</label>
            <select
              value={filters.month}
              onChange={(e) => handleFilterChange('month', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#263247] rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">All Months</option>
              <option value="mar">March</option>
              <option value="apr">April</option>
              <option value="may">May</option>
              <option value="jun">June</option>
              <option value="jul">July</option>
              <option value="aug">August</option>
              <option value="sep">September</option>
              <option value="oct">October</option>
              <option value="nov">November</option>
              <option value="dec">December</option>
            </select>
          </div>

          {/* Previous Outcome */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Previous Outcome</label>
            <select
              value={filters.previousResult}
              onChange={(e) => handleFilterChange('previousResult', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#263247] rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">All Previous Outcomes</option>
              <option value="success">Successful</option>
              <option value="failure">Unsuccessful</option>
              <option value="nonexistent">No Previous Contact</option>
            </select>
          </div>

          {/* Contact Frequency */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Contact Frequency</label>
            <select
              value={filters.campaignRange}
              onChange={(e) => handleFilterChange('campaignRange', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#263247] rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">All Frequencies</option>
              <option value="1">1 Contact</option>
              <option value="2">2 Contacts</option>
              <option value="3-5">3 to 5 Contacts</option>
              <option value="6+">6+ Contacts</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Total Campaign Contacts"
          value={data ? data.kpis.total_records.toLocaleString() : '...'}
          description="Campaign records analyzed from warehouse"
          icon={<Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
          badge={loading ? 'Updating...' : 'Data Ready'}
        />
        <KpiCard
          title="Customers Showing Interest"
          value={data ? data.kpis.positive_responses.toLocaleString() : '...'}
          description="Records where customer subscribed (response = yes)"
          icon={<UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
        />
        <KpiCard
          title="Response Rate"
          value={data ? `${data.kpis.response_rate}%` : '...'}
          description="Percentage of positive subscriptions in this selection"
          icon={<TrendingUp className="w-4 h-4 text-sky-600 dark:text-sky-400" />}
        />
        <KpiCard
          title="Total Contact Attempts"
          value={data ? data.kpis.total_contacts.toLocaleString() : '...'}
          description="Total contact attempts across analyzed records"
          icon={<PhoneCall className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
        />
        <KpiCard
          title="Highest Response Group"
          value={data ? data.kpis.highest_response_group : '...'}
          description="Group with highest response rate in selected data"
          icon={<Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
        />
      </div>

      {/* Campaign Story + What the Data Shows */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Campaign Overview Narrative */}
          <div className="lg:col-span-6 bg-white dark:bg-[#172033] rounded-xl border border-slate-200 dark:border-[#263247] p-5 shadow-sm flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  {data.campaign_story.title}
                </h3>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {data.campaign_story.summary_text}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#263247] flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Focus: <strong className="text-slate-700 dark:text-slate-200">{data.campaign_story.active_focus}</strong>
              </span>
              <button
                onClick={() => onNavigate('explorer')}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-1"
              >
                Explore Performance <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* What the Data Shows */}
          <div className="lg:col-span-6 bg-gradient-to-br from-indigo-50/60 to-purple-50/40 dark:from-indigo-950/30 dark:to-purple-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50 p-5 shadow-sm flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wide">
                  What the Data Shows
                </h3>
              </div>
              <ul className="space-y-2 mt-2">
                {data.insights.map((insight, idx) => (
                  <li key={idx} className="text-xs text-indigo-950 dark:text-indigo-100 flex items-start gap-2">
                    <span className="text-indigo-500 dark:text-indigo-400 font-bold mt-0.5">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-3 pt-2 border-t border-indigo-100/60 dark:border-indigo-900/40">
              Note: Observations describe descriptive patterns in the available dataset and do not imply causal relationships.
            </p>
          </div>
        </div>
      )}

      {/* Visual Analytics Grid (6 Business Charts) */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Customer Response by Age Group */}
          <ChartCard
            title="Customer Response by Age Group"
            subtitle="Shows how response rates differ across age groups in the available campaign data."
          >
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.age_distribution} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="age_group" tick={{ fontSize: 11, fill: axisTickColor }} />
                  <YAxis
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 11, fill: axisTickColor }}
                  />
                  <Tooltip
                    formatter={(v: any) => [`${v}%`, 'Response Rate']}
                    contentStyle={chartTooltipStyle}
                  />
                  <Bar dataKey="response_rate" radius={[6, 6, 0, 0]}>
                    {data.age_distribution.map((entry, index) => (
                      <Cell key={index} fill={getBarColor(entry.response_rate, isDark)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Chart 2: Customer Response by Contact Method */}
          <ChartCard
            title="Customer Response by Contact Method"
            subtitle="Historical response patterns for mobile (cellular) vs landline (telephone)"
          >
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.contact_distribution} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis
                    dataKey="contact_method"
                    tickFormatter={(v) => (v === 'cellular' ? 'Cellular' : 'Telephone')}
                    tick={{ fontSize: 11, fill: axisTickColor }}
                  />
                  <YAxis
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 11, fill: axisTickColor }}
                  />
                  <Tooltip
                    formatter={(v: any) => [`${v}%`, 'Response Rate']}
                    contentStyle={chartTooltipStyle}
                  />
                  <Bar dataKey="response_rate" radius={[6, 6, 0, 0]}>
                    {data.contact_distribution.map((entry, index) => (
                      <Cell key={index} fill={entry.contact_method === 'cellular' ? (isDark ? '#38bdf8' : '#0284c7') : (isDark ? '#64748b' : '#94a3b8')} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Chart 3: Customer Response by Occupation */}
          <ChartCard
            title="Customer Response by Occupation"
            subtitle="Shows historical response rates across customer occupations"
          >
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.job_distribution} margin={{ top: 10, right: 10, left: -15, bottom: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis
                    dataKey="occupation"
                    tickFormatter={(v) => JOB_LABELS[v] ?? v}
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                    tick={{ fontSize: 10, fill: axisTickColor }}
                  />
                  <YAxis
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 11, fill: axisTickColor }}
                  />
                  <Tooltip
                    formatter={(v: any) => [`${v}%`, 'Response Rate']}
                    contentStyle={chartTooltipStyle}
                  />
                  <Bar dataKey="response_rate" radius={[6, 6, 0, 0]}>
                    {data.job_distribution.map((entry, index) => (
                      <Cell key={index} fill={getBarColor(entry.response_rate, isDark)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Chart 4: Campaign Contact Frequency */}
          <ChartCard
            title="Campaign Contact Frequency"
            subtitle="Customers contacted at different frequencies showed different historical response rates"
          >
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.contact_frequency} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="contact_bucket" tick={{ fontSize: 11, fill: axisTickColor }} />
                  <YAxis
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 11, fill: axisTickColor }}
                  />
                  <Tooltip
                    formatter={(v: any) => [`${v}%`, 'Response Rate']}
                    contentStyle={chartTooltipStyle}
                  />
                  <Bar dataKey="response_rate" radius={[6, 6, 0, 0]}>
                    {data.contact_frequency.map((entry, index) => (
                      <Cell key={index} fill={getBarColor(entry.response_rate, isDark)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Chart 5: Previous Campaign Outcome */}
          <ChartCard
            title="Previous Campaign Outcome"
            subtitle="Historical response rate categorized by previous campaign result"
          >
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.poutcome_distribution} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis
                    dataKey="previous_outcome"
                    tickFormatter={(v) => POUTCOME_LABELS[v] ?? v}
                    tick={{ fontSize: 11, fill: axisTickColor }}
                  />
                  <YAxis
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 11, fill: axisTickColor }}
                  />
                  <Tooltip
                    formatter={(v: any) => [`${v}%`, 'Response Rate']}
                    contentStyle={chartTooltipStyle}
                  />
                  <Bar dataKey="response_rate" radius={[6, 6, 0, 0]}>
                    {data.poutcome_distribution.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          entry.previous_outcome === 'success'
                            ? (isDark ? '#10b981' : '#059669')
                            : entry.previous_outcome === 'failure'
                            ? (isDark ? '#fbbf24' : '#d97706')
                            : (isDark ? '#64748b' : '#94a3b8')
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Chart 6: Monthly Campaign Pattern */}
          <ChartCard
            title="Monthly Campaign Pattern"
            subtitle="Historical response rates observed across calendar months"
          >
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthly_pattern} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(v) => v.toUpperCase()}
                    tick={{ fontSize: 11, fill: axisTickColor }}
                  />
                  <YAxis
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 11, fill: axisTickColor }}
                  />
                  <Tooltip
                    formatter={(v: any) => [`${v}%`, 'Response Rate']}
                    contentStyle={chartTooltipStyle}
                  />
                  <Line
                    type="monotone"
                    dataKey="response_rate"
                    stroke={isDark ? '#818cf8' : '#4f46e5'}
                    strokeWidth={2.5}
                    dot={{ fill: isDark ? '#818cf8' : '#4f46e5', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
