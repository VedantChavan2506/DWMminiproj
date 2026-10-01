import React, { useState } from 'react';
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
import { MODELS_BEFORE_SMOTE, MODELS_AFTER_SMOTE } from '../../data/modelMetrics';
import { formatPercent, formatMetric } from '../../utils/formatters';

interface ModelComparisonTableProps {
  initialSmoteState?: boolean;
}

export const ModelComparisonTable: React.FC<ModelComparisonTableProps> = ({
  initialSmoteState = true,
}) => {
  const [afterSmote, setAfterSmote] = useState<boolean>(initialSmoteState);

  const models = afterSmote ? MODELS_AFTER_SMOTE : MODELS_BEFORE_SMOTE;

  // Chart data formatting (multiplied by 100 for percentage visualization)
  const chartData = models.map((m) => ({
    name: m.model,
    Accuracy: Number((m.accuracy * 100).toFixed(2)),
    Precision: Number((m.precision * 100).toFixed(2)),
    Recall: Number((m.recall * 100).toFixed(2)),
    'F1 Score': Number((m.f1 * 100).toFixed(2)),
  }));

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Dataset Resampling State
          </span>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare model performance on original imbalanced data vs SMOTE over-sampled training data
          </p>
        </div>

        <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200/80 self-start sm:self-auto">
          <button
            onClick={() => setAfterSmote(false)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              !afterSmote
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Before SMOTE (Imbalanced)
          </button>
          <button
            onClick={() => setAfterSmote(true)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              afterSmote
                ? 'bg-white text-brand-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            After SMOTE (Balanced 0.5)
          </button>
        </div>
      </div>

      {/* Grouped Bar Chart */}
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: '#475569' }}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(val) => `${val}%`}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <Tooltip
              formatter={(value: any) => [`${value}%`]}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Bar dataKey="Accuracy" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Precision" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Recall" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="F1 Score" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Model</th>
              <th className="py-3 px-4 text-right">Accuracy</th>
              <th className="py-3 px-4 text-right">Precision</th>
              <th className="py-3 px-4 text-right">Recall</th>
              <th className="py-3 px-4 text-right">F1 Score</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {models.map((m) => {
              const isXgb = m.model === 'XGBoost';
              return (
                <tr
                  key={m.model}
                  className={`transition-colors ${
                    isXgb ? 'bg-brand-50/40 font-semibold' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="py-3.5 px-4 flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{m.model}</span>
                    {isXgb && (
                      <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-800">
                        Selected Final Model
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                    {formatMetric(m.accuracy, 6)} ({formatPercent(m.accuracy, 2)})
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                    {formatMetric(m.precision, 6)} ({formatPercent(m.precision, 2)})
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                    <span className={afterSmote && m.recall > 0.75 ? 'text-emerald-700 font-bold' : ''}>
                      {formatMetric(m.recall, 6)} ({formatPercent(m.recall, 2)})
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-900 font-bold">
                    <span className={isXgb ? 'text-brand-700' : ''}>
                      {formatMetric(m.f1, 6)} ({formatPercent(m.f1, 2)})
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {isXgb ? (
                      <span className="inline-block w-2 h-2 rounded-full bg-brand-600" title="Selected Best Model" />
                    ) : (
                      <span className="inline-block w-2 h-2 rounded-full bg-slate-300" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Analysis Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 leading-relaxed text-slate-700">
          <strong className="text-slate-900 block mb-1">Top F1-Score & Balanced Performance:</strong>
          XGBoost achieved the highest F1 Score after SMOTE at <strong>0.657066</strong> and Recall of <strong>0.786638</strong> among the evaluated models, showing superior balance between false alarms and missed subscribers.
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 leading-relaxed text-slate-700">
          <strong className="text-slate-900 block mb-1">High Recall on Decision Tree:</strong>
          Decision Tree achieved Recall of <strong>0.774784</strong> after SMOTE, but with lower Precision (0.507768) and F1 Score (0.613481) compared to the ensemble gradient boosted trees.
        </div>
      </div>
    </div>
  );
};

