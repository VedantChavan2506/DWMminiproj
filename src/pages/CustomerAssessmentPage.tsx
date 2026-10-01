import React, { useState, useEffect } from 'react';
import { assessCustomer, checkBackendHealth } from '../utils/api';
import { PredictionRequest, AssessmentResult } from '../types';
import {
  UserSearch,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  WifiOff,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const JOB_OPTIONS = [
  { value: 'admin.', label: 'Admin / Office Work' },
  { value: 'management', label: 'Management' },
  { value: 'technician', label: 'Technician' },
  { value: 'services', label: 'Services' },
  { value: 'blue-collar', label: 'Blue-Collar / Manual Labour' },
  { value: 'retired', label: 'Retired' },
  { value: 'student', label: 'Student' },
  { value: 'self-employed', label: 'Self-Employed' },
  { value: 'entrepreneur', label: 'Entrepreneur / Business Owner' },
  { value: 'housemaid', label: 'Housemaid / Homemaker' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'unknown', label: 'Occupation Unknown' },
];

const POUTCOME_OPTIONS = [
  { value: 'nonexistent', label: 'No Previous Campaign Contact' },
  { value: 'success', label: 'Successful — Customer Responded Positively' },
  { value: 'failure', label: 'Unsuccessful — Customer Did Not Subscribe' },
];

const fieldClass =
  'w-full px-3 py-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#263247] rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-[#111827] transition-all outline-none';

const labelClass = 'block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5';
const hintClass = 'text-xs text-slate-400 dark:text-slate-500 mt-1';

function InterestBadge({ level }: { level: 'HIGH' | 'MEDIUM' | 'LOW' }) {
  const styles: Record<string, string> = {
    HIGH: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    MEDIUM: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    LOW: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${styles[level]}`}>
      {level === 'HIGH' && <TrendingUp className="w-3.5 h-3.5 mr-1.5" />}
      {level === 'MEDIUM' && <Minus className="w-3.5 h-3.5 mr-1.5" />}
      {level === 'LOW' && <TrendingDown className="w-3.5 h-3.5 mr-1.5" />}
      {level} Interest
    </span>
  );
}

function PriorityBadge({ level }: { level: 'HIGH' | 'MEDIUM' | 'LOW' }) {
  const styles: Record<string, string> = {
    HIGH: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    MEDIUM: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    LOW: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${styles[level]}`}>
      {level} Priority
    </span>
  );
}

export const CustomerAssessmentPage: React.FC = () => {
  const [formData, setFormData] = useState<PredictionRequest>({
    age: 35,
    job: 'admin.',
    contact: 'cellular',
    campaign: 1,
    previous: 0,
    poutcome: 'nonexistent',
    euribor3m: 1.5,
    duration: 250,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    checkBackendHealth().then(setBackendAvailable);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleAssess = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.age < 18 || formData.age > 100) {
      alert('Please enter a valid age between 18 and 100.');
      return;
    }

    setLoading(true);
    setResult(null);
    const res = await assessCustomer(formData);
    setResult(res);
    setLoading(false);

    setTimeout(() => {
      document.getElementById('assessment-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleReset = () => {
    setResult(null);
    setFormData({
      age: 35,
      job: 'admin.',
      contact: 'cellular',
      campaign: 1,
      previous: 0,
      poutcome: 'nonexistent',
      euribor3m: 1.5,
      duration: 250,
    });
  };

  const durationMinutes = Math.floor(formData.duration / 60);
  const durationSeconds = formData.duration % 60;

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Service Status Banner */}
      {backendAvailable === false && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200 text-sm">
          <WifiOff className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
          <div>
            <p className="font-semibold">Assessment service is currently offline.</p>
            <p className="text-xs mt-0.5 text-amber-700 dark:text-amber-300">
              Please ensure the Python Flask backend is running on port 5000.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleAssess} className="space-y-6">
        {/* Section 1: Customer Information */}
        <div className="bg-white dark:bg-[#172033] rounded-xl border border-slate-200 dark:border-[#263247] shadow-sm overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-[#263247] bg-slate-50/50 dark:bg-[#111827]/50">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              Customer Information
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Age */}
            <div>
              <label className={labelClass} htmlFor="age">Customer Age</label>
              <input
                id="age"
                type="number"
                name="age"
                min="18"
                max="100"
                value={formData.age}
                onChange={handleChange}
                required
                className={fieldClass}
              />
              <p className={hintClass}>Enter age between 18 and 100</p>
            </div>

            {/* Occupation */}
            <div>
              <label className={labelClass} htmlFor="job">Occupation</label>
              <select
                id="job"
                name="job"
                value={formData.job}
                onChange={handleChange}
                className={fieldClass}
              >
                {JOB_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Contact Information */}
        <div className="bg-white dark:bg-[#172033] rounded-xl border border-slate-200 dark:border-[#263247] shadow-sm overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-[#263247] bg-slate-50/50 dark:bg-[#111827]/50">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              Contact Information
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Contact Method */}
            <div>
              <label className={labelClass} htmlFor="contact">Contact Method</label>
              <select
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className={fieldClass}
              >
                <option value="cellular">Mobile (Cellular)</option>
                <option value="telephone">Landline (Telephone)</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className={labelClass} htmlFor="duration">
                Current Conversation Duration
              </label>
              <input
                id="duration"
                type="number"
                name="duration"
                min="0"
                max="4000"
                value={formData.duration}
                onChange={handleChange}
                required
                className={fieldClass}
              />
              <p className={hintClass}>
                Duration in seconds &mdash; currently: {durationMinutes}m {durationSeconds}s
              </p>
            </div>

            {/* Number of Contacts in Current Campaign */}
            <div>
              <label className={labelClass} htmlFor="campaign">
                Number of Contacts in Current Campaign
              </label>
              <input
                id="campaign"
                type="number"
                name="campaign"
                min="1"
                max="50"
                value={formData.campaign}
                onChange={handleChange}
                required
                className={fieldClass}
              />
              <p className={hintClass}>How many times has this customer been contacted in this campaign?</p>
            </div>
          </div>
        </div>

        {/* Section 3: Previous Campaign */}
        <div className="bg-white dark:bg-[#172033] rounded-xl border border-slate-200 dark:border-[#263247] shadow-sm overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-[#263247] bg-slate-50/50 dark:bg-[#111827]/50">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              Previous Campaign Information
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Previous Contacts */}
            <div>
              <label className={labelClass} htmlFor="previous">
                Previous Campaign Contacts
              </label>
              <input
                id="previous"
                type="number"
                name="previous"
                min="0"
                max="20"
                value={formData.previous}
                onChange={handleChange}
                required
                className={fieldClass}
              />
              <p className={hintClass}>
                Number of contacts made before this campaign (0 = first-time customer)
              </p>
            </div>

            {/* Previous Campaign Result */}
            <div>
              <label className={labelClass} htmlFor="poutcome">Previous Campaign Result</label>
              <select
                id="poutcome"
                name="poutcome"
                value={formData.poutcome}
                onChange={handleChange}
                className={fieldClass}
              >
                {POUTCOME_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Market Information */}
        <div className="bg-white dark:bg-[#172033] rounded-xl border border-slate-200 dark:border-[#263247] shadow-sm overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-[#263247] bg-slate-50/50 dark:bg-[#111827]/50">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                Market Information
              </h2>
              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Info className="w-3.5 h-3.5" />
                Used to contextualise the assessment
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="max-w-sm">
              <label className={labelClass} htmlFor="euribor3m">
                Current Interest Rate Environment
              </label>
              <div className="relative">
                <input
                  id="euribor3m"
                  type="number"
                  name="euribor3m"
                  step="0.001"
                  min="0"
                  max="6"
                  value={formData.euribor3m}
                  onChange={handleChange}
                  required
                  className={fieldClass + ' pr-10'}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">%</span>
              </div>
              <p className={hintClass}>
                3-month Euribor rate — prevailing short-term interbank rate (typically 0–6%).
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Assessing Customer…</span>
              </>
            ) : (
              <>
                <UserSearch className="w-4 h-4" />
                <span>Assess Customer Interest</span>
              </>
            )}
          </button>
          {result && (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-3.5 rounded-xl border border-slate-200 dark:border-[#263247] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#111827] font-semibold text-sm transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}
        </div>
      </form>

      {/* Assessment Result */}
      {result && (
        <div id="assessment-result" className="scroll-mt-8">
          {result.error ? (
            <div className="flex items-start gap-3 p-5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
              <div>
                <p className="font-semibold">Assessment Unavailable</p>
                <p className="text-sm mt-0.5">{result.error}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#172033] rounded-xl border border-slate-200 dark:border-[#263247] shadow-sm overflow-hidden transition-colors">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-[#263247] bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-950/30 dark:to-indigo-950/30">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  <h2 className="font-bold text-slate-900 dark:text-slate-100">Customer Interest Check</h2>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Result Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Interest Level */}
                  <div className="p-4 rounded-xl border border-slate-100 dark:border-[#263247] bg-slate-50 dark:bg-[#111827] text-center">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Interest Level</p>
                    <InterestBadge level={result.interestLevel} />
                  </div>

                  {/* Estimated Likelihood */}
                  <div className="p-4 rounded-xl border border-slate-100 dark:border-[#263247] bg-slate-50 dark:bg-[#111827] text-center">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Interest Likelihood</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-slate-100">{result.estimatedLikelihood.toFixed(1)}%</p>
                    <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          result.interestLevel === 'HIGH'
                            ? 'bg-emerald-500'
                            : result.interestLevel === 'MEDIUM'
                            ? 'bg-amber-400'
                            : 'bg-slate-400'
                        }`}
                        style={{ width: `${Math.min(100, result.estimatedLikelihood)}%` }}
                      />
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="p-4 rounded-xl border border-slate-100 dark:border-[#263247] bg-slate-50 dark:bg-[#111827] text-center">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Priority</p>
                    <PriorityBadge level={result.priority} />
                  </div>
                </div>

                {/* Suggested Follow-Up */}
                <div className={`p-4 rounded-xl border ${
                  result.priority === 'HIGH'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                    : result.priority === 'MEDIUM'
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
                    : 'bg-slate-50 dark:bg-[#111827] border-slate-200 dark:border-[#263247]'
                }`}>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Suggested Follow-Up</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{result.recommendedAction}</p>
                </div>

                {/* Historical Context from Data Warehouse */}
                {result.historicalContext && (
                  <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                    <p className="text-xs font-bold uppercase tracking-wide text-indigo-900 dark:text-indigo-300 mb-1.5 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      Historical Context (Campaign Warehouse)
                    </p>
                    <p className="text-sm text-slate-800 dark:text-slate-200">
                      Customers with similar selected characteristics showed a{' '}
                      <strong className="text-indigo-700 dark:text-indigo-300 font-bold text-base">
                        {result.historicalContext.historical_response_rate}%
                      </strong>{' '}
                      historical response rate in the available campaign data (
                      {result.historicalContext.positive_responses.toLocaleString()} subscribed out of{' '}
                      {result.historicalContext.matching_records.toLocaleString()} contacts analyzed).
                    </p>
                    <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 italic">
                      {result.historicalContext.disclaimer}
                    </p>
                  </div>
                )}

                {/* Why this assessment */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#263247]">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    Why this assessment?
                  </p>
                  <ul className="space-y-2">
                    {result.whyExplanation.map((point, i) => (
                      <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-slate-400 dark:text-slate-500 italic">
                    This assessment is based on historical campaign patterns. It should be used as a supporting decision tool, not as a guarantee of customer behaviour.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerAssessmentPage;
