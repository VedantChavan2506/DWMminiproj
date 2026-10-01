import React from 'react';
import { ChartCard } from '../components/common/ChartCard';
import { InsightCard } from '../components/common/InsightCard';
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
  AGE_DATA,
  JOB_DATA,
  DURATION_STATS,
  MARITAL_DATA,
  HOUSING_DATA,
  LOAN_DATA,
} from '../data/bankData';
import { formatNumber, formatPercent } from '../utils/formatters';

export const CustomerAnalysisPage: React.FC = () => {
  // Sort jobs ascending for horizontal display
  const sortedJobs = [...JOB_DATA].reverse();

  return (
    <div className="space-y-8 pb-12">
      {/* Overview stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Peak Age Group
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            55+ Years (19.8%)
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Followed by 18-25 group (24.0% subscription rate)
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Top Job Propensity
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            Students (31.4%)
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Retired customers also high at 25.2%
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Duration Disparity
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            449s vs 164s
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Median call duration: Subscribers vs Non-subscribers
          </p>
        </div>
      </div>

      {/* Row 1: Age Groups & Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Age Groups (5 cols) */}
        <div className="lg:col-span-5">
          <ChartCard
            title="Subscription Rate by Age Group"
            subtitle="Higher conversion among young adults and senior citizens"
          >
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={AGE_DATA}
                  margin={{ top: 10, right: 20, left: -10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="ageGroup" tick={{ fontSize: 12, fill: '#475569' }} />
                  <YAxis
                    domain={[0, 30]}
                    tickFormatter={(val) => `${val}%`}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip
                    formatter={(val: any, _: string, item: any) => [
                      `${val}% (${formatNumber(item.payload.yes)} of ${formatNumber(item.payload.total)})`,
                      'Subscription Rate',
                    ]}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                    {AGE_DATA.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.rate > 15 ? '#0284c7' : '#94a3b8'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 mt-2">
              <strong>U-Shaped Pattern:</strong> Clients aged 18-25 (24.0%) and 55+ (19.8%) have disposable savings or career-start plans, whereas middle-aged working clients (26-55) exhibit lower acceptance (~9.9% - 10.3%).
            </div>
          </ChartCard>
        </div>

        {/* Chart 2: Jobs Horizontal Bar (7 cols) */}
        <div className="lg:col-span-7">
          <ChartCard
            title="Subscription Rate by Job Category"
            subtitle="All 12 occupational groups ordered by subscription rate"
          >
            <div className="h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sortedJobs}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 35]}
                    tickFormatter={(val) => `${val}%`}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    width={110}
                    tick={{ fontSize: 12, fill: '#334155' }}
                  />
                  <Tooltip
                    formatter={(val: any, _: string, item: any) => [
                      `${val}% (${formatNumber(item.payload.yes)} / ${formatNumber(item.payload.total)})`,
                      'Subscription Rate',
                    ]}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                    {sortedJobs.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.rate > 20
                            ? '#059669'
                            : entry.rate < 8
                            ? '#f43f5e'
                            : '#6366f1'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Row 2: Call Duration Box Plot Stats & Marital/Loans */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 3: Duration Comparison Card (6 cols) */}
        <div className="lg:col-span-6">
          <ChartCard
            title="Call Duration vs Subscription"
            subtitle="Subscribers spend on average 2.5x more time on phone calls"
          >
            <div className="space-y-6 pt-2">
              <div className="grid grid-cols-2 gap-4">
                {/* No Subscribers Duration */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Non-Subscribers (NO)
                  </div>
                  <div className="text-3xl font-extrabold text-slate-800 font-mono">
                    {DURATION_STATS.no.median}s
                  </div>
                  <span className="text-[11px] text-slate-500">Median Call Duration</span>
                  <div className="mt-3 space-y-1 text-xs text-slate-600 border-t border-slate-200/80 pt-2 font-mono">
                    <div className="flex justify-between">
                      <span>Mean:</span> <strong>{DURATION_STATS.no.mean}s</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>IQR (Q1 - Q3):</span> <strong>{DURATION_STATS.no.q1}s - {DURATION_STATS.no.q3}s</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Max (Non-outlier):</span> <strong>{DURATION_STATS.no.max}s</strong>
                    </div>
                  </div>
                </div>

                {/* Subscribers Duration */}
                <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200">
                  <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2">
                    Subscribers (YES)
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-900 font-mono">
                    {DURATION_STATS.yes.median}s
                  </div>
                  <span className="text-[11px] text-emerald-700">Median Call Duration</span>
                  <div className="mt-3 space-y-1 text-xs text-emerald-800 border-t border-emerald-200 pt-2 font-mono">
                    <div className="flex justify-between">
                      <span>Mean:</span> <strong>{DURATION_STATS.yes.mean}s</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>IQR (Q1 - Q3):</span> <strong>{DURATION_STATS.yes.q1}s - {DURATION_STATS.yes.q3}s</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Max (Non-outlier):</span> <strong>{DURATION_STATS.yes.max}s</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-amber-50/80 rounded-lg border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <strong>Operational Note on Duration:</strong> While call duration is highly predictive in retrospective data, call duration is unknown before making the call. Hence, real-time campaign routing must leverage customer pre-call indicators (job, age, euribor, poutcome) for initial lead prioritization.
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Chart 4, 5, 6: Marital, Housing, Loan (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Marital Status */}
          <ChartCard
            title="Subscription Rate by Marital Status"
            subtitle="Single customers show slight uplift (14.0%) compared to married (10.2%)"
          >
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={MARITAL_DATA}
                  margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis
                    domain={[0, 20]}
                    tickFormatter={(val) => `${val}%`}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Subscription Rate']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="rate" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Housing & Personal Loans Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ChartCard
              title="Housing Loan"
              subtitle="Minimal variance (~11.6% vs 10.9%)"
            >
              <div className="h-[120px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={HOUSING_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 15]} tickFormatter={(val) => `${val}%`} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(val: any) => [`${val}%`]} />
                    <Bar dataKey="rate" fill="#38bdf8" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard
              title="Personal Loan"
              subtitle="Little discrimination (~11.3% vs 10.9%)"
            >
              <div className="h-[120px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={LOAN_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 15]} tickFormatter={(val) => `${val}%`} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(val: any) => [`${val}%`]} />
                    <Bar dataKey="rate" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </div>
      </div>
    </div>
  );
};

