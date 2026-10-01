import React, { useState, useEffect } from 'react';
import { ChartCard } from '../components/common/ChartCard';
import { Badge } from '../components/common/Badge';
import { predictCustomer, checkBackendHealth } from '../utils/api';
import { PredictionRequest, PredictionResponse } from '../types';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Zap,
  Server,
  Activity,
} from 'lucide-react';
import { formatPercent } from '../utils/formatters';

export const PredictionPage: React.FC = () => {
  const [formData, setFormData] = useState<PredictionRequest>({
    age: 32,
    job: 'admin.',
    contact: 'cellular',
    campaign: 1,
    previous: 0,
    poutcome: 'nonexistent',
    euribor3m: 4.857,
    duration: 320,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);

  // Check health on mount
  useEffect(() => {
    checkBackendHealth().then((isUp) => setBackendAvailable(isUp));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const res = await predictCustomer(formData);
    setResult(res);
    setLoading(false);
  };

  const applyPreset = (preset: 'high' | 'low' | 'average') => {
    if (preset === 'high') {
      setFormData({
        age: 24,
        job: 'student',
        contact: 'cellular',
        campaign: 1,
        previous: 2,
        poutcome: 'success',
        euribor3m: 0.85,
        duration: 650,
      });
    } else if (preset === 'low') {
      setFormData({
        age: 48,
        job: 'blue-collar',
        contact: 'telephone',
        campaign: 5,
        previous: 0,
        poutcome: 'nonexistent',
        euribor3m: 4.962,
        duration: 85,
      });
    } else {
      setFormData({
        age: 38,
        job: 'technician',
        contact: 'cellular',
        campaign: 2,
        previous: 0,
        poutcome: 'nonexistent',
        euribor3m: 3.821,
        duration: 260,
      });
    }
    setResult(null);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Backend Integration Status Alert */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          backendAvailable === true
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            : backendAvailable === false
            ? 'bg-amber-50/80 border-amber-200 text-amber-900'
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Server className="w-4 h-4 shrink-0" />
          <div>
            <span className="font-bold">
              {backendAvailable === true
                ? 'Python Flask Model API Connected (Port 5000)'
                : backendAvailable === false
                ? 'Model API Offline — Demo Prediction Mode'
                : 'Connecting to Prediction Server...'}
            </span>
            <p className="opacity-90 mt-0.5">
              {backendAvailable === true
                ? 'Live inference using exact serialized preprocessing pipeline + trained XGBClassifier'
                : 'Predictions will be labeled "Demo Prediction — model API not connected" per academic integrity standards.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            checkBackendHealth().then((isUp) => setBackendAvailable(isUp));
          }}
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 font-medium shrink-0 self-start sm:self-auto"
        >
          Check Connection
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column (7 cols) */}
        <div className="lg:col-span-7">
          <ChartCard
            title="Customer Feature Input Form"
            subtitle="Specify the 8 predictive attributes used by the final XGBoost model"
            action={
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 hidden sm:inline">Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPreset('high')}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                >
                  High Propensity
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('low')}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                >
                  Low Propensity
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('average')}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Average
                </button>
              </div>
            }
          >
            <form onSubmit={handlePredict} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Age */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Customer Age (years)
                  </label>
                  <input
                    type="number"
                    name="age"
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">18 to 100</span>
                </div>

                {/* Job */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Occupation (Job)
                  </label>
                  <select
                    name="job"
                    value={formData.job}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all outline-none"
                  >
                    <option value="admin.">Admin</option>
                    <option value="blue-collar">Blue-Collar</option>
                    <option value="entrepreneur">Entrepreneur</option>
                    <option value="housemaid">Housemaid</option>
                    <option value="management">Management</option>
                    <option value="retired">Retired</option>
                    <option value="self-employed">Self-Employed</option>
                    <option value="services">Services</option>
                    <option value="student">Student</option>
                    <option value="technician">Technician</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="unknown">Unknown</option>
                  </select>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">One-hot encoded category</span>
                </div>

                {/* Contact Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Communication Type
                  </label>
                  <select
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all outline-none"
                  >
                    <option value="cellular">Cellular</option>
                    <option value="telephone">Telephone (Landline)</option>
                  </select>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Channel used</span>
                </div>

                {/* Previous Campaign Outcome */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Previous Campaign Outcome (poutcome)
                  </label>
                  <select
                    name="poutcome"
                    value={formData.poutcome}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all outline-none"
                  >
                    <option value="nonexistent">Nonexistent (New contact)</option>
                    <option value="failure">Failure (Previously refused)</option>
                    <option value="success">Success (Previously subscribed)</option>
                  </select>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Historical touchpoint</span>
                </div>

                {/* Campaign Contacts */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Campaign Contacts (Current Campaign)
                  </label>
                  <input
                    type="number"
                    name="campaign"
                    min="1"
                    max="50"
                    value={formData.campaign}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Number of calls this campaign</span>
                </div>

                {/* Previous Contacts */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Previous Contacts (Before this Campaign)
                  </label>
                  <input
                    type="number"
                    name="previous"
                    min="0"
                    max="20"
                    value={formData.previous}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Past interactions</span>
                </div>

                {/* Euribor 3M */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Euribor 3-Month Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    name="euribor3m"
                    min="0"
                    max="6"
                    value={formData.euribor3m}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Benchmark interest rate</span>
                </div>

                {/* Call Duration */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Call Duration (seconds)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    min="0"
                    max="4000"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Duration in seconds ({Math.floor(formData.duration / 60)}m {formData.duration % 60}s)
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Activity className="w-4 h-4 animate-spin" />
                      <span>Running XGBoost Inference...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Predict Subscription</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </ChartCard>
        </div>

        {/* Prediction Results Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <ChartCard
            title="Prediction Outcome"
            subtitle="Output generated by trained XGBoost binary classification model"
          >
            {result ? (
              <div className="space-y-6">
                {result.error ? (
                  /* Offline Demo Notice */
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Demo Prediction — model API not connected</span>
                    </div>
                    <p className="leading-relaxed">
                      The Python backend service (<code>backend/app.py</code>) could not be reached. In accordance with strict academic guidelines, client-side heuristics are not substituted for the true model. Please start the backend to obtain exact XGBoost inferences.
                    </p>
                  </div>
                ) : (
                  /* Successful Prediction */
                  <div className="space-y-5">
                    <div
                      className={`p-6 rounded-2xl border text-center transition-all ${
                        result.prediction === 'yes'
                          ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                          : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-2">
                        {result.prediction === 'yes' ? (
                          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                        ) : (
                          <XCircle className="w-10 h-10 text-slate-500" />
                        )}
                      </div>

                      <span className="text-xs font-bold uppercase tracking-wider opacity-75">
                        Predicted Class
                      </span>
                      <h3 className="text-2xl font-black tracking-tight mt-0.5">
                        {result.prediction === 'yes'
                          ? 'LIKELY TO SUBSCRIBE'
                          : 'UNLIKELY TO SUBSCRIBE'}
                      </h3>

                      <div className="mt-4 pt-4 border-t border-slate-200/60 flex items-center justify-around">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider opacity-75 block">
                            Subscription Probability
                          </span>
                          <span className="text-2xl font-extrabold font-mono">
                            {formatPercent(result.probability, 1)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider opacity-75 block">
                            Decision Threshold
                          </span>
                          <span className="text-2xl font-extrabold font-mono text-slate-500">
                            50.0%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar / Probability Gauge */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">Low Propensity</span>
                        <span className="text-slate-800 font-mono">
                          {formatPercent(result.probability, 2)}
                        </span>
                        <span className="text-slate-500">High Propensity</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            result.probability >= 0.5 ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, result.probability * 100))}%` }}
                        />
                      </div>
                    </div>

                    {/* Feature Signal Explanation */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
                      <span className="font-bold text-slate-800 block">Primary Contributing Drivers:</span>
                      <p>
                        • <strong>Duration:</strong> {formData.duration}s ({formData.duration > 300 ? 'Strong positive signal' : 'Short call duration limits interest'}).
                      </p>
                      <p>
                        • <strong>Macroeconomic Euribor:</strong> {formData.euribor3m}% ({formData.euribor3m < 2.0 ? 'Favorable low-rate regime' : 'High rate environment'}).
                      </p>
                      <p>
                        • <strong>Previous Outcome:</strong> {formData.poutcome} ({formData.poutcome === 'success' ? 'High historical affinity' : 'Standard baseline'}).
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[280px] flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-700">Awaiting Input</h4>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Fill in the customer attributes or choose a preset and click "Predict Subscription" to execute the model.
                  </p>
                </div>
              </div>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

