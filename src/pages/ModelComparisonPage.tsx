import React from 'react';
import { ModelComparisonTable } from '../components/ml/ModelComparisonTable';
import { ChartCard } from '../components/common/ChartCard';
import { InsightCard } from '../components/common/InsightCard';

export const ModelComparisonPage: React.FC = () => {
  return (
    <div className="space-y-8 pb-12">
      {/* Model Benchmark Suite */}
      <ChartCard
        title="Comprehensive Machine Learning Benchmark"
        subtitle="Side-by-side comparison of 4 supervised learning algorithms under baseline and resampled training conditions"
      >
        <ModelComparisonTable />
      </ChartCard>

      {/* Model Behavior Deep Dives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InsightCard title="XGBoost Superiority Rationale" type="conclusion">
          <p>
            XGBoost achieved the highest F1 Score after SMOTE at <strong>0.657066</strong> and Recall of <strong>0.786638</strong> among the evaluated models. Its gradient-boosted decision tree architecture effectively models complex non-linear interactions between call duration, Euribor rates, and previous campaign touchpoints.
          </p>
        </InsightCard>

        <InsightCard title="Decision Tree vs Random Forest Trade-offs" type="info">
          <p>
            Decision Tree achieved Recall of <strong>0.774784</strong> after SMOTE, but exhibited lower Precision (0.507768). Random Forest maintained higher Precision (0.571966) and Accuracy (0.905901), but achieved lower Recall (0.655172). XGBoost provided the optimal convergence of high sensitivity and controlled false alarms.
          </p>
        </InsightCard>
      </div>
    </div>
  );
};

