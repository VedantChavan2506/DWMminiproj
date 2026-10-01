import React, { useState } from 'react';
import { CORRELATION_KEYS, CORRELATION_MATRIX } from '../../data/bankData';

export const CorrelationHeatmap: React.FC = () => {
  const [hoveredCell, setHoveredCell] = useState<{
    row: string;
    col: string;
    val: number;
  } | null>(null);

  // Short label map for clean display
  const labelMap: Record<string, string> = {
    age: 'Age',
    duration: 'Duration',
    campaign: 'Campaign',
    pdays: 'Pdays',
    previous: 'Previous',
    'emp.var.rate': 'Emp.Var',
    'cons.price.idx': 'Price.Idx',
    'cons.conf.idx': 'Conf.Idx',
    euribor3m: 'Euribor3M',
    'nr.employed': 'Nr.Employed',
    y_encoded: 'Target (y)',
  };

  const getHeatmapColor = (val: number) => {
    if (val === 1) return 'bg-indigo-900 text-white font-bold';
    if (val >= 0.7) return 'bg-indigo-700 text-white';
    if (val >= 0.4) return 'bg-indigo-500 text-white';
    if (val >= 0.2) return 'bg-indigo-300 text-slate-900';
    if (val >= 0.05) return 'bg-indigo-100 text-slate-900';
    if (val > -0.05) return 'bg-slate-100 text-slate-600';
    if (val > -0.2) return 'bg-amber-100 text-slate-900';
    if (val > -0.4) return 'bg-amber-300 text-slate-900';
    if (val > -0.7) return 'bg-rose-500 text-white';
    return 'bg-rose-700 text-white';
  };

  return (
    <div className="space-y-4">
      {/* Heatmap Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Correlation Range:</span>
          <div className="flex items-center gap-1">
            <span className="px-2 py-0.5 rounded bg-rose-700 text-white font-mono text-[10px]">-1.0</span>
            <span className="px-2 py-0.5 rounded bg-amber-200 text-slate-800 font-mono text-[10px]">-0.3</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">0.0</span>
            <span className="px-2 py-0.5 rounded bg-indigo-200 text-slate-800 font-mono text-[10px]">+0.3</span>
            <span className="px-2 py-0.5 rounded bg-indigo-900 text-white font-mono text-[10px]">+1.0</span>
          </div>
        </div>

        {hoveredCell ? (
          <div className="px-3 py-1 bg-white border border-slate-300 rounded-lg shadow-xs font-mono text-xs">
            <span className="font-semibold text-slate-800">{labelMap[hoveredCell.row]}</span> ×{' '}
            <span className="font-semibold text-slate-800">{labelMap[hoveredCell.col]}</span> ={' '}
            <span className="font-bold text-indigo-700">{hoveredCell.val.toFixed(3)}</span>
          </div>
        ) : (
          <span className="text-slate-500 italic">Hover over any cell to view exact r</span>
        )}
      </div>

      {/* Grid container with responsive scroll */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[700px]">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr>
                <th className="p-1.5 text-left text-slate-400 font-normal"></th>
                {CORRELATION_KEYS.map((k) => (
                  <th
                    key={k}
                    className="p-1.5 text-center font-semibold text-slate-700 truncate max-w-[65px]"
                    title={k}
                  >
                    {labelMap[k] || k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CORRELATION_KEYS.map((rowKey) => (
                <tr key={rowKey}>
                  <td
                    className="p-1.5 text-right font-semibold text-slate-700 whitespace-nowrap pr-2"
                    title={rowKey}
                  >
                    {labelMap[rowKey] || rowKey}
                  </td>
                  {CORRELATION_KEYS.map((colKey) => {
                    const val = CORRELATION_MATRIX[rowKey]?.[colKey] ?? 0;
                    const isTarget = rowKey === 'y_encoded' || colKey === 'y_encoded';
                    return (
                      <td
                        key={colKey}
                        onMouseEnter={() => setHoveredCell({ row: rowKey, col: colKey, val })}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`p-1.5 text-center font-mono transition-all border border-white cursor-pointer ${getHeatmapColor(
                          val
                        )} ${isTarget ? 'ring-1 ring-brand-500/40' : ''}`}
                        title={`${rowKey} × ${colKey}: ${val}`}
                      >
                        {val === 1 ? '1.0' : val.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
        <strong className="text-slate-900 block mb-1">Economic Indicator Clustering:</strong>
        Economic conditions show meaningful relationships with customer subscription behavior. High collinearity is observed between <code className="text-indigo-700 font-mono">euribor3m</code>, <code className="text-indigo-700 font-mono">emp.var.rate</code>, and <code className="text-indigo-700 font-mono">nr.employed</code> (r &gt; 0.90), which are negatively correlated with subscription outcome. In contrast, <code className="text-indigo-700 font-mono">duration</code> exhibits the highest positive linear correlation with deposit subscription (r = +0.405).
      </div>
    </div>
  );
};

