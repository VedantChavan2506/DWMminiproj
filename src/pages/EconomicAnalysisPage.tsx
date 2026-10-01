import React from 'react';
import { ChartCard } from '../components/common/ChartCard';
import { InsightCard } from '../components/common/InsightCard';
import { CorrelationHeatmap } from '../components/ml/CorrelationHeatmap';
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
import { EURIBOR_DATA } from '../data/bankData';
import { formatNumber } from '../utils/formatters';

export const EconomicAnalysisPage: React.FC = () => {
  return (
    <div className="space-y-8 pb-12">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Low Interest Rate Regime (0-1%)
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            49.8% Conversion
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Term deposit yields are attractive compared to alternative cash holdings
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            High Interest Rate Regime (4-5%)
          </span>
          <div className="text-2xl font-bold text-rose-600 mt-1">
            4.6% Conversion
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Represents 60%+ of dataset volume during tighter macroeconomic periods
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Macro-Feature Rank
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            #2 in XGBoost
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Euribor 3M accounts for 17.13% total predictive importance
          </p>
        </div>
      </div>

      {/* Chart 1: Euribor 3M Ranges */}
      <ChartCard
        title="Subscription Rate by Euribor 3M Range"
        subtitle="Analysis across Euribor interest rate intervals (0-1, 1-2, 2-3, 3-4, 4-5, 5-6)"
      >
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={EURIBOR_DATA}
              margin={{ top: 15, right: 20, left: -10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="range"
                label={{ value: 'Euribor 3-Month Interest Rate Range (%)', position: 'insideBottom', offset: -5, fontSize: 11 }}
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
              <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                {EURIBOR_DATA.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.rate > 30
                        ? '#059669'
                        : entry.rate > 10
                        ? '#0284c7'
                        : '#f43f5e'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="p-3.5 bg-slate-50 rounded-lg text-xs text-slate-600 mt-3 leading-relaxed">
          <strong>Macroeconomic Sensitivity:</strong> As Euribor3m increases, the probability of term deposit subscription tends to decrease substantially. When interest rates are low (0-1%), customers seek stable yields through fixed-term deposits (49.8% subscription rate). As rates climb past 4%, competition from bonds, equity markets, and alternative liquidity accounts suppresses deposit response to ~4.6%.
        </div>
      </ChartCard>

      {/* Chart 2: Correlation Heatmap */}
      <ChartCard
        title="Numerical Correlation Heatmap"
        subtitle="Pearson correlation coefficients between 10 continuous numerical features and the target variable"
      >
        <CorrelationHeatmap />
      </ChartCard>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InsightCard title="Macroeconomic Indicators Influence" type="insight">
          <p>
            Economic conditions show meaningful relationships with customer subscription behavior. Interest rates (<code className="font-mono text-slate-800">euribor3m</code>) and labor market conditions (<code className="font-mono text-slate-800">emp.var.rate</code>) move in tandem and strongly shape household liquidity choices.
          </p>
        </InsightCard>

        <InsightCard title="Feature Engineering & Multicollinearity" type="info">
          <p>
            Due to collinearity among macroeconomic indices (e.g., <code className="font-mono text-slate-800">euribor3m</code> with <code className="font-mono text-slate-800">nr.employed</code> at r = 0.95), selecting <code className="font-mono text-slate-800">euribor3m</code> as the representative economic indicator minimized redundancy while retaining primary market signal.
          </p>
        </InsightCard>
      </div>
    </div>
  );
};
