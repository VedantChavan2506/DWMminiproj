import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceDot,
} from 'recharts';
import { ROC_CURVE_DATA, XGBOOST_FINAL_METRICS } from '../../data/modelMetrics';

export const RocCurveChart: React.FC = () => {
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            ROC Area Under Curve (AUC)
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            AUC = {XGBOOST_FINAL_METRICS.auc.toFixed(4)}
          </span>
        </div>
        <span className="text-xs text-slate-500">
          Evaluated on 8,236 test instances
        </span>
      </div>

      <div className="h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={ROC_CURVE_DATA}
            margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="fpr"
              type="number"
              domain={[0, 1]}
              tickCount={6}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{
                value: 'False Positive Rate (1 - Specificity)',
                position: 'insideBottom',
                offset: -10,
                fontSize: 12,
                fill: '#475569',
              }}
            />
            <YAxis
              dataKey="tpr"
              type="number"
              domain={[0, 1]}
              tickCount={6}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{
                value: 'True Positive Rate (Recall / Sensitivity)',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                fontSize: 12,
                fill: '#475569',
              }}
            />
            <Tooltip
              formatter={(value: any, name: string) => [
                typeof value === 'number' ? value.toFixed(4) : value,
                name === 'tpr' ? 'True Positive Rate (TPR)' : name === 'baseline' ? 'Random Chance' : name,
              ]}
              labelFormatter={(label: any) => `FPR: ${Number(label).toFixed(4)}`}
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
            {/* Random Baseline */}
            <Line
              type="linear"
              dataKey="baseline"
              name="Random Classifier (AUC = 0.50)"
              stroke="#94a3b8"
              strokeDasharray="4 4"
              dot={false}
              strokeWidth={1.5}
            />
            {/* XGBoost ROC Curve */}
            <Line
              type="monotone"
              dataKey="tpr"
              name="XGBoost Classifier (AUC = 0.9448)"
              stroke="#4f46e5"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#4f46e5' }}
              activeDot={{ r: 6, fill: '#4338ca' }}
            />
            <ReferenceDot
              x={0.0772}
              y={0.7866}
              r={5}
              fill="#059669"
              stroke="#ffffff"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
        <strong className="text-slate-800">Operational Point:</strong> At the default 0.50 probability threshold, the model operates at <span className="font-semibold text-emerald-700">TPR = 78.66%</span> with a low <span className="font-semibold text-slate-700">FPR = 7.72%</span>, demonstrating strong discriminative separation between buyers and non-buyers.
      </div>
    </div>
  );
};

