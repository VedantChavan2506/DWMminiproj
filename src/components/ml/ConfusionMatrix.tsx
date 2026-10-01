import React from 'react';
import { ConfusionMatrixData } from '../../types';
import { formatNumber, formatPercent } from '../../utils/formatters';

interface ConfusionMatrixProps {
  data: ConfusionMatrixData;
  modelName?: string;
}

export const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({
  data,
  modelName = 'XGBoost',
}) => {
  const total = data.tn + data.fp + data.fn + data.tp;
  const tnPct = (data.tn / total) * 100;
  const fpPct = (data.fp / total) * 100;
  const fnPct = (data.fn / total) * 100;
  const tpPct = (data.tp / total) * 100;

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <div className="min-w-[440px] max-w-lg mx-auto bg-slate-50/50 p-6 rounded-2xl border border-slate-200/80">
          {/* Column Headers (Predicted) */}
          <div className="text-center font-semibold text-xs text-slate-500 uppercase tracking-wider mb-2">
            Predicted Class
          </div>

          <div className="grid grid-cols-[100px_1fr_1fr] gap-3">
            {/* Top Left Empty Cell */}
            <div className="flex items-center justify-center font-semibold text-xs text-slate-500 uppercase tracking-wider">
              Actual Class
            </div>
            
            <div className="text-center py-2 px-3 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-700">
              Predicted NO
            </div>
            <div className="text-center py-2 px-3 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-700">
              Predicted YES
            </div>

            {/* Row 1: Actual NO */}
            <div className="flex items-center justify-center py-4 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-700">
              Actual NO
            </div>

            {/* True Negative (TN) */}
            <div className="bg-emerald-50/90 border-2 border-emerald-300/80 rounded-xl p-4 text-center transition-all hover:shadow-sm">
              <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide mb-1">
                True Negative (TN)
              </div>
              <div className="text-2xl font-extrabold text-emerald-900">
                {formatNumber(data.tn)}
              </div>
              <div className="text-[11px] font-medium text-emerald-700 mt-1">
                {formatPercent(tnPct)} of test set
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">
                Correctly identified non-subscribers
              </div>
            </div>

            {/* False Positive (FP) */}
            <div className="bg-amber-50/90 border-2 border-amber-300/80 rounded-xl p-4 text-center transition-all hover:shadow-sm">
              <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wide mb-1">
                False Positive (FP)
              </div>
              <div className="text-2xl font-extrabold text-amber-900">
                {formatNumber(data.fp)}
              </div>
              <div className="text-[11px] font-medium text-amber-700 mt-1">
                {formatPercent(fpPct)} of test set
              </div>
              <div className="text-[10px] text-amber-600 mt-0.5">
                Type I Error (Outreached in vain)
              </div>
            </div>

            {/* Row 2: Actual YES */}
            <div className="flex items-center justify-center py-4 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-700">
              Actual YES
            </div>

            {/* False Negative (FN) */}
            <div className="bg-rose-50/90 border-2 border-rose-300/80 rounded-xl p-4 text-center transition-all hover:shadow-sm">
              <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wide mb-1">
                False Negative (FN)
              </div>
              <div className="text-2xl font-extrabold text-rose-900">
                {formatNumber(data.fn)}
              </div>
              <div className="text-[11px] font-medium text-rose-700 mt-1">
                {formatPercent(fnPct)} of test set
              </div>
              <div className="text-[10px] text-rose-600 mt-0.5">
                Type II Error (Missed subscriber)
              </div>
            </div>

            {/* True Positive (TP) */}
            <div className="bg-emerald-50/90 border-2 border-emerald-400 rounded-xl p-4 text-center transition-all hover:shadow-sm">
              <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide mb-1">
                True Positive (TP)
              </div>
              <div className="text-2xl font-extrabold text-emerald-900">
                {formatNumber(data.tp)}
              </div>
              <div className="text-[11px] font-medium text-emerald-700 mt-1">
                {formatPercent(tpPct)} of test set
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">
                Successfully converted subscribers
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Analysis List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
          <span className="font-bold text-slate-800 block mb-1">High Specificity & Negative Retention</span>
          <p className="text-slate-600 leading-relaxed">
            The model correctly classified <strong className="text-slate-900">{formatNumber(data.tn)}</strong> non-subscribers and <strong className="text-slate-900">{formatNumber(data.tp)}</strong> subscribers, yielding 90.75% total accuracy.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/70">
          <span className="font-bold text-rose-800 block mb-1">Minimal Missed Opportunities</span>
          <p className="text-rose-700 leading-relaxed">
            Only <strong className="text-rose-900">{formatNumber(data.fn)}</strong> actual subscribers were missed (False Negatives), demonstrating a high Recall of 78.66% on the minority class.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70">
          <span className="font-bold text-amber-800 block mb-1">Targeted Campaign Efficiency</span>
          <p className="text-amber-700 leading-relaxed">
            <strong className="text-amber-900">{formatNumber(data.fp)}</strong> non-subscribers were classified as potential subscribers. In telemarketing, this trade-off is advantageous compared to losing real deposits.
          </p>
        </div>
      </div>
    </div>
  );
};

