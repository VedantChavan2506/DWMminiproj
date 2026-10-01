import React from 'react';
import { ChartCard } from '../components/common/ChartCard';
import { InsightCard } from '../components/common/InsightCard';
import { FeatureImportanceChart } from '../components/ml/FeatureImportanceChart';
import { TOP_10_FEATURES } from '../data/modelMetrics';
import { formatPercent, formatMetric } from '../utils/formatters';

export const FeatureImportancePage: React.FC = () => {
  return (
    <div className="space-y-8 pb-12">
      {/* Top 10 Chart Card */}
      <ChartCard
        title="Top 10 Important Features - XGBoost"
        subtitle="Feature importance derived from information gain across 200 decision trees"
      >
        <FeatureImportanceChart />
      </ChartCard>

      {/* Structured Feature Table */}
      <ChartCard
        title="Feature Contribution Breakdown"
        subtitle="Detailed analysis of the top 10 model variables"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Feature Name</th>
                <th className="py-3 px-4">Original Variable</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Importance Weight</th>
                <th className="py-3 px-4 text-right">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {TOP_10_FEATURES.map((item, idx) => (
                <tr key={item.feature} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">
                    #{idx + 1}
                  </td>
                  <td className="py-3 px-4 font-mono text-indigo-700 font-semibold">
                    {item.feature}
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-medium">
                    {item.label}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">
                    {formatMetric(item.importance, 6)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {formatPercent(item.importance, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Explanatory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InsightCard title="Call Duration Dominance (29.48%)" type="insight">
          <p>
            <code className="font-mono text-slate-800">duration</code> is the most influential feature by a wide margin. Customers willing to spend 5 to 15 minutes speaking with bank advisors are actively listening to financial terms, drastically increasing closing probability.
          </p>
        </InsightCard>

        <InsightCard title="Macroeconomic & Touchpoint Signals" type="info">
          <p>
            <code className="font-mono text-slate-800">euribor3m</code> (17.13%) and <code className="font-mono text-slate-800">campaign</code> (8.90%) confirm that macroeconomic conditions and contact volume heavily steer customer responsiveness. Prior successful campaign history (<code className="font-mono text-slate-800">poutcome_success</code>) also serves as a strong positive catalyst.
          </p>
        </InsightCard>
      </div>
    </div>
  );
};

