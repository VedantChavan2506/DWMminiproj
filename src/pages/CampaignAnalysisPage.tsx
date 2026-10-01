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
  CONTACT_DATA,
  POUTCOME_DATA,
  CAMPAIGN_CONTACTS_DATA,
  PREVIOUS_CONTACTS_DATA,
  MONTH_DATA,
} from '../data/bankData';
import { formatNumber } from '../utils/formatters';

export const CampaignAnalysisPage: React.FC = () => {
  return (
    <div className="space-y-8 pb-12">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Previous Campaign Success
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            65.1% Conversion
          </div>
          <p className="text-xs text-slate-500 mt-1">
            vs 8.8% for clients with no prior interaction
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Optimal Touchpoints
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            1 to 2 Calls
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Acceptance drops from 13.0% (1 contact) to 4.3% (6+ contacts)
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Channel Efficiency
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            Cellular (14.7%)
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Nearly 3x higher response than fixed telephone (5.2%)
          </p>
        </div>
      </div>

      {/* Primary Highlight: Previous Campaign Outcome & Contact Type */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Most Important Chart: Previous Outcome (7 cols) */}
        <div className="lg:col-span-7">
          <ChartCard
            title="Previous Campaign Outcome (poutcome)"
            subtitle="Prior campaign success is the strongest historical behavioral predictor"
          >
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={POUTCOME_DATA}
                  margin={{ top: 15, right: 20, left: -10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#475569' }} />
                  <YAxis
                    domain={[0, 80]}
                    tickFormatter={(val) => `${val}%`}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip
                    formatter={(val: any, _: string, item: any) => [
                      `${val}% (${formatNumber(item.payload.yes)} subscribers out of ${formatNumber(item.payload.total)})`,
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
                    {POUTCOME_DATA.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.category === 'success'
                            ? '#059669'
                            : entry.category === 'failure'
                            ? '#f59e0b'
                            : '#94a3b8'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="p-3 bg-emerald-50/80 rounded-lg text-xs text-emerald-900 border border-emerald-200 mt-2">
              <strong>Key Finding:</strong> Customers who previously responded successfully are particularly valuable leads. At 65.1% subscription rate, prioritizing previous responders yields the highest conversion efficiency for outbound sales desks.
            </div>
          </ChartCard>
        </div>

        {/* Contact Type vs Subscription (5 cols) */}
        <div className="lg:col-span-5">
          <ChartCard
            title="Contact Communication Type"
            subtitle="Subscription rate by communication medium (Cellular vs Telephone)"
          >
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={CONTACT_DATA}
                  margin={{ top: 15, right: 20, left: -10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#475569' }} />
                  <YAxis
                    domain={[0, 20]}
                    tickFormatter={(val) => `${val}%`}
                    tick={{ fontSize: 11, fill: '#64748b' }}
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
                  <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                    <Cell fill="#0284c7" />
                    <Cell fill="#94a3b8" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 mt-2">
              Cellular reachability allows direct customer engagement with higher pickup rates and longer interactive discussions compared to fixed landlines.
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Row 2: Campaign Contacts & Previous Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Contacts vs Subscription */}
        <ChartCard
          title="Campaign Contacts During Current Campaign"
          subtitle="Excessive repetitive contact yields diminishing returns and customer fatigue"
        >
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={CAMPAIGN_CONTACTS_DATA}
                margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="contacts"
                  label={{ value: 'Number of Contacts', position: 'insideBottom', offset: -5, fontSize: 11 }}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  domain={[0, 16]}
                  tickFormatter={(val) => `${val}%`}
                  tick={{ fontSize: 11, fill: '#64748b' }}
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
                <Bar dataKey="rate" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Number of Previous Contacts */}
        <ChartCard
          title="Number of Previous Contacts Before Current Campaign"
          subtitle="Customers contacted in previous campaigns show progressively higher conversion"
        >
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={PREVIOUS_CONTACTS_DATA}
                margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="previous"
                  label={{ value: 'Previous Contacts Count', position: 'insideBottom', offset: -5, fontSize: 11 }}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  domain={[0, 60]}
                  tickFormatter={(val) => `${val}%`}
                  tick={{ fontSize: 11, fill: '#64748b' }}
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
                <Bar dataKey="rate" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Row 3: Month Seasonality */}
      <ChartCard
        title="Subscription Rate by Campaign Month"
        subtitle="Campaign timing seasonality shows high response in March, September, October, and December"
      >
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={MONTH_DATA}
              margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#475569' }} />
              <YAxis
                domain={[0, 60]}
                tickFormatter={(val) => `${val}%`}
                tick={{ fontSize: 11, fill: '#64748b' }}
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
              <Bar dataKey="rate" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Structured Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InsightCard title="Previous Interaction Indicator" type="insight">
          <p>
            Previous interaction is a strong indicator of campaign response. Customers with a history of positive engagement are significantly more receptive to future term deposit offerings.
          </p>
        </InsightCard>

        <InsightCard title="Customer Relationship Depth" type="conclusion">
          <p>
            Existing customer relationships can improve conversion. However, repeated calls within the same campaign without prior interest quickly lead to diminishing returns, suggesting campaigns should enforce strict contact caps.
          </p>
        </InsightCard>
      </div>
    </div>
  );
};

