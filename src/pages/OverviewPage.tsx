import React from 'react';
import { ChartCard } from '../components/common/ChartCard';
import { InsightCard } from '../components/common/InsightCard';
import { Badge } from '../components/common/Badge';
import { Landmark, Target, Database, BarChart2, ShieldCheck, Zap } from 'lucide-react';
import { NavigationItem } from '../types';

interface OverviewPageProps {
  onNavigate: (page: NavigationItem) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 pb-12">
      {/* Project Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-10 shadow-sm">
        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">Machine Learning Mini Project</Badge>
            <Badge variant="neutral">BE AI & Data Science</Badge>
            <Badge variant="success">Final Model: XGBoost</Badge>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Bank Marketing Campaign Response Prediction
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            A Machine Learning approach for identifying retail banking customers likely to subscribe to a long-term deposit, enabling targeted resource allocation, reducing contact fatigue, and optimizing campaign ROI.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-all shadow-xs"
            >
              Explore Dashboard
            </button>
            <button
              onClick={() => onNavigate('technical')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/20"
            >
              View ML Pipeline
            </button>
          </div>
        </div>
      </div>

      {/* Core Project Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">The Business Problem</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Telemarketing campaigns are capital and human intensive. Contacting random customer lists causes client churn and low conversion (~11.3%). Predictive modeling filters high-propensity prospects before phone contact.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Class Imbalance Challenge</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Out of 41,128 customer records, only 3,711 subscribed (YES). Standard models achieve 91% accuracy simply by predicting NO for everyone, resulting in a disastrous 38% Recall. SMOTE resampled the minority class to 33.3%.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">The XGBoost Solution</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            XGBoost combined with SMOTE achieved 78.66% Recall, 65.71% F1 Score, and 0.945 AUC. It identifies 730 out of 928 actual subscribers in the unseen test set with minimal false positives (564).
          </p>
        </div>
      </div>

      {/* Dataset & Feature Summary */}
      <ChartCard
        title="Project Scope & Technical Foundation"
        subtitle="Key specifications and methodology highlights"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-500">
              Dataset Characteristics (UCI Repository)
            </h4>
            <ul className="space-y-2.5 text-slate-600">
              <li className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <span>Original Dataset Entries:</span>
                <span className="font-mono font-semibold text-slate-800">41,128</span>
              </li>
              <li className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <span>Duplicate Records Removed:</span>
                <span className="font-mono font-semibold text-slate-800">12 (41,176 clean)</span>
              </li>
              <li className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <span>Total Attributes:</span>
                <span className="font-mono font-semibold text-slate-800">21 (Bank, Campaign, Social/Economic)</span>
              </li>
              <li className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <span>Selected Model Features:</span>
                <span className="font-mono font-semibold text-slate-800">8 High-impact features</span>
              </li>
              <li className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <span>Target Class:</span>
                <span className="font-mono font-semibold text-slate-800">y (binary: yes / no)</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-500">
              Machine Learning Workflow
            </h4>
            <div className="space-y-2 text-slate-600">
              <p>
                1. <strong>Exploratory Data Analysis:</strong> Uncovered non-linear relationship in age (18-25 & 55+), student/retired high conversion, and strong inverse correlation with Euribor 3M rate.
              </p>
              <p>
                2. <strong>Feature Selection:</strong> Discarded variables with low variance/predictive power (marital, housing, loan) to prevent overfitting and noise.
              </p>
              <p>
                3. <strong>Preprocessing & SMOTE:</strong> Scaled numerical features with StandardScaler, encoded categorical features with OneHotEncoder, and over-sampled training partition with SMOTE.
              </p>
              <p>
                4. <strong>Model Selection:</strong> Systematic benchmarking proved XGBoost superior to Logistic Regression, Decision Trees, and Random Forests.
              </p>
            </div>
          </div>
        </div>
      </ChartCard>
    </div>
  );
};

