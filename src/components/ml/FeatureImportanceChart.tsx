import React from 'react';
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
import { TOP_10_FEATURES } from '../../data/modelMetrics';
import { formatPercent } from '../../utils/formatters';

export const FeatureImportanceChart: React.FC = () => {
  // Sorted for horizontal bar chart (lowest at top or reversed for descending display)
  const chartData = [...TOP_10_FEATURES].reverse();

  const getBarColor = (category: string) => {
    switch (category) {
      case 'Call Details':
        return '#0284c7'; // Sky
      case 'Economic':
        return '#4f46e5'; // Indigo
      case 'Campaign History':
        return '#059669'; // Emerald
      case 'Customer Profile':
        return '#d97706'; // Amber
      default:
        return '#64748b';
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Category Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="text-slate-500 font-medium">Feature Categories:</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]" />
          <span className="text-slate-700">Call Details</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4f46e5]" />
          <span className="text-slate-700">Economic Indicators</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
          <span className="text-slate-700">Campaign History</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]" />
          <span className="text-slate-700">Customer Profile</span>
        </span>
      </div>

      <div className="h-[380px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 0.35]}
              tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={160}
              tick={{ fontSize: 12, fill: '#334155' }}
            />
            <Tooltip
              formatter={(value: any, _: string, item: any) => [
                `${formatPercent(value, 2)} (${Number(value).toFixed(6)})`,
                `Importance (${item.payload.category})`,
              ]}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.category)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-slate-500 italic leading-relaxed">
        * Feature importance indicates which variables contributed most to the model's predictive decisions. It does not establish causation.
      </p>
    </div>
  );
};

