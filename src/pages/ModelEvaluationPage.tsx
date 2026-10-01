import React from 'react';
import { KpiCard } from '../components/common/KpiCard';
import { ChartCard } from '../components/common/ChartCard';
import { ConfusionMatrix } from '../components/ml/ConfusionMatrix';
import { RocCurveChart } from '../components/ml/RocCurveChart';
import {
  XGBOOST_FINAL_METRICS,
  XGBOOST_CONFUSION_MATRIX,
} from '../data/modelMetrics';
import { CheckCircle2, ShieldCheck, Target, Award, Activity } from 'lucide-react';

export const ModelEvaluationPage: React.FC = () => {
  return (
    <div className="space-y-8 pb-12">
      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Accuracy"
          value="90.75%"
          description="Overall correct classifications"
          icon={<CheckCircle2 className="w-4 h-4 text-slate-600" />}
        />
        <KpiCard
          title="Precision"
          value="56.41%"
          description="True positive accuracy (Positive Predictive Value)"
          icon={<Target className="w-4 h-4 text-sky-600" />}
        />
        <KpiCard
          title="Recall"
          value="78.66%"
          description="Sensitivity (Subscribers captured)"
          icon={<Activity className="w-4 h-4 text-emerald-600" />}
          trend={{ value: 'High Sensitivity', isPositive: true }}
        />
        <KpiCard
          title="F1 Score"
          value="65.71%"
          description="Harmonic mean of precision & recall"
          icon={<ShieldCheck className="w-4 h-4 text-indigo-600" />}
        />
        <KpiCard
          title="ROC AUC"
          value="94.48%"
          description="Class separation power (0.9448)"
          icon={<Award className="w-4 h-4 text-amber-600" />}
          trend={{ value: 'Excellent Separation', isPositive: true }}
        />
      </div>

      {/* Confusion Matrix & ROC Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Confusion Matrix (6 cols) */}
        <div className="lg:col-span-6">
          <ChartCard
            title="Confusion Matrix (XGBoost Test Set)"
            subtitle="2x2 evaluation on 8,236 unseen holdout observations"
          >
            <ConfusionMatrix data={XGBOOST_CONFUSION_MATRIX} />
          </ChartCard>
        </div>

        {/* ROC Curve (6 cols) */}
        <div className="lg:col-span-6">
          <ChartCard
            title="XGBoost ROC Curve"
            subtitle="Receiver Operating Characteristic curve with AUC = 0.9448"
          >
            <RocCurveChart />
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

