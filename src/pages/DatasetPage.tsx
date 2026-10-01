import React, { useState, useMemo } from 'react';
import { ChartCard } from '../components/common/ChartCard';
import { Badge } from '../components/common/Badge';
import { SAMPLE_DATASET_ROWS, DATASET_SUMMARY } from '../data/bankData';
import { DatasetRow } from '../types';
import { Search, Filter, Database, CheckCircle2, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export const DatasetPage: React.FC = () => {
  const [search, setSearch] = useState<string>('');
  const [filterTarget, setFilterTarget] = useState<string>('all');
  const [filterJob, setFilterJob] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  // Filtered rows
  const filteredRows = useMemo(() => {
    return SAMPLE_DATASET_ROWS.filter((row: DatasetRow) => {
      const matchesSearch =
        search === '' ||
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(search.toLowerCase())
        );

      const matchesTarget =
        filterTarget === 'all' || row.y.toLowerCase() === filterTarget.toLowerCase();

      const matchesJob =
        filterJob === 'all' || row.job.toLowerCase() === filterJob.toLowerCase();

      return matchesSearch && matchesTarget && matchesJob;
    });
  }, [search, filterTarget, filterJob]);

  // Paginated rows
  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  // Unique jobs for filter
  const uniqueJobs = useMemo(() => {
    const set = new Set(SAMPLE_DATASET_ROWS.map((r) => r.job));
    return Array.from(set).sort();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Dataset Metadata KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Records
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            41,128
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Original dataset entries
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Duplicates Removed
          </span>
          <div className="text-2xl font-bold text-amber-600 mt-1 font-mono">
            12 Rows
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Clean analytical rows: 41,176
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Feature Count
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            21 Attributes
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Demographic, campaign, & economic
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Target Variable
          </span>
          <div className="text-2xl font-bold text-indigo-600 mt-1 font-mono">
            y (yes / no)
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Term deposit subscription
          </p>
        </div>
      </div>

      {/* Searchable Data Explorer */}
      <ChartCard
        title="Dataset Sample Explorer"
        subtitle="Searchable sample of records from the cleaned UCI Bank Marketing repository"
        action={
          <Badge variant="primary" size="sm">
            Displaying {filteredRows.length} sample records
          </Badge>
        }
      >
        <div className="space-y-4">
          {/* Controls row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by any field (job, education, marital, month...)"
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Filter className="w-3.5 h-3.5" />
                <span>Filters:</span>
              </div>

              <select
                value={filterTarget}
                onChange={(e) => {
                  setFilterTarget(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
              >
                <option value="all">All Targets</option>
                <option value="yes">y = yes (Subscribed)</option>
                <option value="no">y = no (Declined)</option>
              </select>

              <select
                value={filterJob}
                onChange={(e) => {
                  setFilterJob(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
              >
                <option value="all">All Jobs</option>
                {uniqueJobs.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200/80">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3">Age</th>
                  <th className="py-3 px-3">Job</th>
                  <th className="py-3 px-3">Marital</th>
                  <th className="py-3 px-3">Education</th>
                  <th className="py-3 px-3">Default</th>
                  <th className="py-3 px-3">Housing</th>
                  <th className="py-3 px-3">Loan</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Month</th>
                  <th className="py-3 px-3 text-right">Duration (s)</th>
                  <th className="py-3 px-3 text-right">Campaign</th>
                  <th className="py-3 px-3 text-right">Pdays</th>
                  <th className="py-3 px-3 text-right">Previous</th>
                  <th className="py-3 px-3">Poutcome</th>
                  <th className="py-3 px-3 text-right">Euribor3M</th>
                  <th className="py-3 px-3 text-center">Subscribed (y)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors font-mono text-[11px]">
                      <td className="py-2.5 px-3 font-semibold text-slate-800 font-sans">{r.age}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-700">{r.job}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-600">{r.marital}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-600">{r.education}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-500">{r.default}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-600">{r.housing}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-600">{r.loan}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-600">{r.contact}</td>
                      <td className="py-2.5 px-3 font-sans uppercase text-slate-600">{r.month}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-800">{r.duration}</td>
                      <td className="py-2.5 px-3 text-right text-slate-700">{r.campaign}</td>
                      <td className="py-2.5 px-3 text-right text-slate-500">{r.pdays}</td>
                      <td className="py-2.5 px-3 text-right text-slate-700">{r.previous}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-600">{r.poutcome}</td>
                      <td className="py-2.5 px-3 text-right text-slate-700">{r.euribor3m}</td>
                      <td className="py-2.5 px-3 text-center font-sans">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.y.toLowerCase() === 'yes'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {r.y.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={16} className="py-8 text-center text-slate-400 font-sans">
                      No records match the active filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, filteredRows.length)} of {filteredRows.length} rows
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-slate-800">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </ChartCard>
    </div>
  );
};

