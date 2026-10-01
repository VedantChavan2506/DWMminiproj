import React from 'react';
import { ChartCard } from '../components/common/ChartCard';
import { InsightCard } from '../components/common/InsightCard';
import { Badge } from '../components/common/Badge';
import {
  Database,
  Trash2,
  Search,
  Filter,
  Cpu,
  GitBranch,
  Layers,
  Wrench,
  CheckCircle2,
  Award,
  Sparkles,
  ArrowDown,
  ArrowRight,
} from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  const pipelineSteps = [
    {
      step: 1,
      title: 'Data Collection',
      icon: <Database className="w-5 h-5 text-brand-600" />,
      desc: 'UCI Bank Marketing Dataset (bank-additional-full.csv) containing 41,188 rows and 21 attributes from direct Portuguese telemarketing campaigns.',
      details: 'Demographic, economic, and contact touchpoints.',
    },
    {
      step: 2,
      title: 'Data Cleaning',
      icon: <Trash2 className="w-5 h-5 text-amber-600" />,
      desc: 'Identification and removal of 12 duplicate records. Verification of zero missing values and handling of unknown categorical entries.',
      details: 'Resulting clean analytical dataset: 41,176 records.',
    },
    {
      step: 3,
      title: 'Exploratory Data Analysis',
      icon: <Search className="w-5 h-5 text-indigo-600" />,
      desc: 'Univariate and bivariate statistical analysis across demographic groups, economic indices, contact channels, and monthly trends.',
      details: 'Discovered high conversion in students, retirees, and low Euribor rates.',
    },
    {
      step: 4,
      title: 'Feature Selection',
      icon: <Filter className="w-5 h-5 text-rose-600" />,
      desc: 'Discarded low-variance and non-discriminative features (marital, housing, loan). Selected 8 primary features with strong signal.',
      details: 'Reduced dimensionality from 21 down to 8 high-impact attributes.',
    },
    {
      step: 5,
      title: 'Preprocessing Pipeline',
      icon: <Cpu className="w-5 h-5 text-sky-600" />,
      desc: 'StandardScaler applied to numerical attributes; OneHotEncoder applied to categorical attributes with handle_unknown="ignore".',
      details: 'Assembled via scikit-learn ColumnTransformer.',
    },
    {
      step: 6,
      title: 'Train/Test Split',
      icon: <GitBranch className="w-5 h-5 text-purple-600" />,
      desc: 'Stratified 80/20 train/test split preserving the 11.3% minority subscription ratio in both partitions.',
      details: 'Train: 32,940 rows | Test: 8,236 rows.',
    },
    {
      step: 7,
      title: 'SMOTE Resampling',
      icon: <Layers className="w-5 h-5 text-emerald-600" />,
      desc: 'Synthetic Minority Over-sampling Technique applied strictly to the training partition (sampling_strategy=0.5).',
      details: 'Boosted YES instances from 3,711 to 14,614.',
    },
    {
      step: 8,
      title: 'Model Training',
      icon: <Wrench className="w-5 h-5 text-slate-700" />,
      desc: 'Benchmarked 4 algorithms: Logistic Regression, Decision Tree, Random Forest, and XGBoost Classifier.',
      details: 'Evaluated both with and without SMOTE training.',
    },
    {
      step: 9,
      title: 'Model Evaluation',
      icon: <CheckCircle2 className="w-5 h-5 text-teal-600" />,
      desc: 'Rigorous assessment on holdout test set using Accuracy, Precision, Recall, F1 Score, Confusion Matrix, and ROC AUC.',
      details: 'XGBoost achieved top F1 (0.6571) and Recall (0.7866).',
    },
    {
      step: 10,
      title: 'XGBoost Finalization',
      icon: <Award className="w-5 h-5 text-amber-500" />,
      desc: 'Selected XGBClassifier(n_estimators=200, max_depth=5, learning_rate=0.05, eval_metric="logloss").',
      details: 'Serialized preprocessor.pkl and xgb_model.pkl.',
    },
    {
      step: 11,
      title: 'YES / NO Prediction API',
      icon: <Sparkles className="w-5 h-5 text-brand-600" />,
      desc: 'Deployment of real-time REST endpoint (/predict) accepting customer data and returning probability and subscription decision.',
      details: 'Full interactive integration with frontend dashboard.',
    },
  ];

  const selectedFeatures = [
    { name: 'age', type: 'Numerical', desc: 'Customer age in years (StandardScaler)' },
    { name: 'job', type: 'Categorical', desc: 'Occupation: 12 categories (OneHotEncoder)' },
    { name: 'contact', type: 'Categorical', desc: 'Communication type: cellular / telephone (OneHotEncoder)' },
    { name: 'campaign', type: 'Numerical', desc: 'Number of contacts during current campaign (StandardScaler)' },
    { name: 'previous', type: 'Numerical', desc: 'Number of contacts before current campaign (StandardScaler)' },
    { name: 'poutcome', type: 'Categorical', desc: 'Outcome of previous campaign: success, failure, nonexistent' },
    { name: 'euribor3m', type: 'Numerical', desc: 'Euribor 3-month interest rate percentage (StandardScaler)' },
    { name: 'duration', type: 'Numerical', desc: 'Last contact duration in seconds (StandardScaler)' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Selected Features Card */}
      <ChartCard
        title="Selected Model Features"
        subtitle="8 attributes identified through exploratory analysis and feature selection"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {selectedFeatures.map((f) => (
            <div
              key={f.name}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-brand-300 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <code className="font-mono font-bold text-brand-700 text-sm">
                  {f.name}
                </code>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    f.type === 'Numerical'
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {f.type}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Visual Pipeline Workflow */}
      <ChartCard
        title="End-to-End Machine Learning Pipeline"
        subtitle="Step-by-step methodology executed from raw dataset ingestion to live inference"
      >
        <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-6 my-4">
          {pipelineSteps.map((step, idx) => (
            <div key={step.step} className="relative group">
              {/* Step indicator node */}
              <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 w-8 h-8 rounded-full bg-white border-2 border-brand-500 flex items-center justify-center text-xs font-bold text-brand-700 shadow-xs group-hover:scale-110 transition-transform">
                {step.step}
              </div>

              {/* Step Content Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/80 hover:shadow-xs transition-all">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                    {step.icon}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {step.title}
                  </h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 ml-auto">
                    Phase {step.step}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.desc}
                </p>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Specification:</span>
                  <span>{step.details}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Methodological Best Practices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InsightCard title="Strict Stratified Evaluation" type="info">
          <p>
            To avoid data leakage, test sets were strictly kept untouched during SMOTE oversampling. The test set represents the natural 11.3% class distribution to reflect genuine real-world marketing conditions.
          </p>
        </InsightCard>

        <InsightCard title="Pipeline Reproducibility" type="conclusion">
          <p>
            The entire pipeline was bundled with scikit-learn and XGBoost pipelines, ensuring that future incoming customer inputs undergo the exact same statistical scaling and one-hot encoding transformations without human error.
          </p>
        </InsightCard>
      </div>
    </div>
  );
};

