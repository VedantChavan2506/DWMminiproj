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
  Legend,
  Cell,
} from 'recharts';
import {
  MODELS_BEFORE_SMOTE,
  MODELS_AFTER_SMOTE,
  SMOTE_DISTRIBUTION,
} from '../data/modelMetrics';
import { formatNumber, formatPercent } from '../utils/formatters';

export const SmoteAnalysisPage: React.FC = () => {
  // Distribution chart data
  const classBalanceData = [
    {
      stage: 'Before SMOTE (Original Train)',
      NO: SMOTE_DISTRIBUTION.before.no,
      YES: SMOTE_DISTRIBUTION.before.yes,
      yesRate: SMOTE_DISTRIBUTION.before.rate,
    },
    {
      stage: 'After SMOTE (Resampled Train)',
      NO: SMOTE_DISTRIBUTION.after.no,
      YES: SMOTE_DISTRIBUTION.after.yes,
      yesRate: SMOTE_DISTRIBUTION.after.rate,
    },
  ];

  // Recall comparison across all 4 models
  const recallComparisonData = MODELS_BEFORE_SMOTE.map((m, idx) => {
    const afterM = MODELS_AFTER_SMOTE[idx];
    return {
      model: m.model,
      'Before SMOTE': Number((m.recall * 100).toFixed(2)),
      'After SMOTE': Number((afterM.recall * 100).toFixed(2)),
      gain: Number(((afterM.recall - m.recall) * 100).toFixed(2)),
    };
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Imbalance KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Initial Minority Ratio
          </span>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            11.3% (1 : 7.9)
          </div>
          <p className="text-xs text-slate-500 mt-1">
            3,711 subscribers vs 29,229 non-subscribers
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Post-SMOTE Minority Ratio
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            33.3% (1 : 2.0)
          </div>
          <p className="text-xs text-slate-500 mt-1">
            14,614 synthetic + real subscribers in training
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Average Recall Gain
          </span>
          <div className="text-2xl font-bold text-brand-600 mt-1">
            +23.4%
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Substantial improvement across all 4 classifiers
          </p>
        </div>
      </div>

      {/* Row 1: Before/After SMOTE Class Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <ChartCard
            title="Class Distribution: Before vs After SMOTE"
            subtitle="Training set target counts before and after synthetic minority oversampling"
          >
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={classBalanceData}
                  margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis
                    tickFormatter={(val) => `${formatNumber(val)}`}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      `${formatNumber(Number(value))} entries`,
                      `Class: ${name}`,
                    ]}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="NO" name="NO (Majority Class)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="YES" name="YES (Minority Class)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 space-y-2 text-xs text-slate-600">
              <p>
                <strong>Why SMOTE was necessary:</strong> The YES class is significantly smaller than the NO class. This severe imbalance causes machine learning models to favor the majority class, achieving misleadingly high accuracy while failing to detect actual subscribers.
              </p>
              <p>
                <strong>Methodological Rigor:</strong> SMOTE was applied <em>only</em> to the training data (<code className="font-mono text-slate-800">sampling_strategy=0.5</code>) after train/test split. The test set (8,236 rows) remained un-resampled to ensure unbiased real-world generalization.
              </p>
            </div>
          </ChartCard>
        </div>

        {/* Row 1, Col 2: Recall Improvement Chart */}
        <div className="lg:col-span-6">
          <ChartCard
            title="Recall Comparison: Before vs After SMOTE"
            subtitle="Ability to capture actual subscribers across all 4 evaluated models"
          >
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={recallComparisonData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="model" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(val) => `${val}%`}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip
                    formatter={(value: any, name: string) => [`${value}%`, name]}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="Before SMOTE" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="After SMOTE" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
              <strong>Key Finding:</strong> SMOTE substantially improved Recall across all evaluated models. Logistic Regression Recall jumped from <strong>38.25%</strong> to <strong>73.28%</strong> (+35.0%), and XGBoost attained the top Recall of <strong>78.66%</strong> (+23.2%).
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Analytical Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InsightCard title="The Accuracy Paradox in Banking" type="warning">
          <p>
            In imbalanced banking datasets, a naive model predicting "NO" for every applicant achieves 88.7% accuracy, but captures 0% of potential subscribers. Recall (sensitivity) is the primary metric for marketing campaigns because missing a prospective depositor carries a substantial opportunity cost.
          </p>
        </InsightCard>

        <InsightCard title="Preventing Data Leakage with Pipelines" type="info">
          <p>
            Applying SMOTE before the train-test split leads to optimistic bias due to synthetic points leaking test distribution into training. In our pipeline, preprocessing and SMOTE were strictly fitted on the training split, guaranteeing uncompromised test set integrity.
          </p>
        </InsightCard>
      </div>
    </div>
  );
};

