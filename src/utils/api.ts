import {
  PredictionRequest,
  PredictionResponse,
  AssessmentResult,
  InterestLevel,
  DashboardAnalyticsResponse,
  DashboardFilters,
  OlapRow,
  WarehouseSchemaResponse,
  WarehouseTableSample,
  HistoricalContext,
} from '../types';

const API_BASE_URL = 'http://localhost:5000';

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}

// Low-level predict (for Technical Details / Debugging)
export async function predictCustomer(
  input: PredictionRequest
): Promise<PredictionResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with ${res.status}`);
    }

    const data = await res.json();
    return { prediction: data.prediction, probability: data.probability };
  } catch {
    return { prediction: 'no', probability: 0, error: 'unavailable' };
  }
}

/**
 * Business-facing customer assessment function.
 * Maps XGBoost model output into a business-friendly AssessmentResult,
 * and attaches empirical historical context from SQLite Data Warehouse.
 */
export async function assessCustomer(
  input: PredictionRequest
): Promise<AssessmentResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Service error');
    }

    const data = await res.json();
    const prob = data.probability as number;
    const level = data.interest_level as InterestLevel;

    // Build plain-language explanation bullets
    const explanation: string[] = [];
    explanation.push('Customer interaction characteristics were analyzed.');

    const durationMins = Math.round(input.duration / 60);
    if (input.duration > 300) {
      explanation.push(`Conversation duration (${durationMins} min) indicates high customer engagement during the call.`);
    } else if (input.duration < 120) {
      explanation.push(`Brief conversation duration (${durationMins} min) was recorded.`);
    }

    if (input.poutcome === 'success') {
      explanation.push('Previous campaign interaction was recorded as successful in historical records.');
    } else if (input.poutcome === 'failure') {
      explanation.push('Previous campaign contact did not result in a subscription.');
    } else {
      explanation.push('No previous campaign interaction on record.');
    }

    if (input.campaign > 3) {
      explanation.push(`Customer has been contacted ${input.campaign} times in the current campaign cycle.`);
    }

    if (input.euribor3m < 2.0) {
      explanation.push('Prevailing interest rate environment was considered favorable for deposit products.');
    } else if (input.euribor3m > 4.0) {
      explanation.push('Prevailing interest rate environment was factored into the assessment.');
    }

    return {
      interestLevel: level,
      estimatedLikelihood: data.estimated_likelihood ?? Math.round(prob * 100),
      priority: data.priority,
      recommendedAction: data.recommended_action,
      whyExplanation: explanation,
      rawProbability: prob,
      historicalContext: data.historical_context,
    };
  } catch {
    return {
      interestLevel: 'LOW',
      estimatedLikelihood: 0,
      priority: 'LOW',
      recommendedAction: 'Assessment service is currently offline. Please ensure the backend is running.',
      whyExplanation: ['Service unreachable.'],
      rawProbability: 0,
      error: 'Assessment service is currently unavailable. Please start the backend.',
    };
  }
}

// ─── Data Warehouse & OLAP API Helpers ───────────────────────────────────────

export async function fetchWarehouseSummary(
  filters?: Partial<DashboardFilters>
): Promise<DashboardAnalyticsResponse> {
  const params = new URLSearchParams();
  if (filters?.ageGroup && filters.ageGroup !== 'all') params.set('age_group', filters.ageGroup);
  if (filters?.occupation && filters.occupation !== 'all') params.set('job', filters.occupation);
  if (filters?.contactMethod && filters.contactMethod !== 'all') params.set('contact', filters.contactMethod);
  if (filters?.month && filters.month !== 'all') params.set('month', filters.month);
  if (filters?.previousResult && filters.previousResult !== 'all') params.set('poutcome', filters.previousResult);
  if (filters?.campaignRange && filters.campaignRange !== 'all') params.set('campaign_range', filters.campaignRange);

  const url = `${API_BASE_URL}/api/warehouse/summary${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) {
    throw new Error(`Warehouse API error: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchOlapRollup(dimension: string = 'age_group'): Promise<OlapRow[]> {
  const res = await fetch(`${API_BASE_URL}/api/warehouse/olap/rollup?dimension=${encodeURIComponent(dimension)}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error('Roll-up operation failed.');
  const json = await res.json();
  return json.data;
}

export async function fetchOlapDrilldown(
  parentDim: string,
  parentVal: string,
  drillDim: string
): Promise<OlapRow[]> {
  const params = new URLSearchParams({
    parent_dim: parentDim,
    parent_value: parentVal,
    drill_dim: drillDim,
  });
  const res = await fetch(`${API_BASE_URL}/api/warehouse/olap/drilldown?${params.toString()}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error('Drill-down operation failed.');
  const json = await res.json();
  return json.data;
}

export async function fetchOlapSlice(
  dimension: string,
  value: string
): Promise<DashboardAnalyticsResponse> {
  const params = new URLSearchParams({ dimension, value });
  const res = await fetch(`${API_BASE_URL}/api/warehouse/olap/slice?${params.toString()}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error('Slice operation failed.');
  const json = await res.json();
  return json.data;
}

export async function fetchOlapDice(
  filters: Record<string, any>
): Promise<DashboardAnalyticsResponse> {
  const res = await fetch(`${API_BASE_URL}/api/warehouse/olap/dice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error('Dice operation failed.');
  const json = await res.json();
  return json.data;
}

export async function fetchWarehouseTables(): Promise<WarehouseSchemaResponse> {
  const res = await fetch(`${API_BASE_URL}/api/warehouse/tables`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error('Failed to retrieve warehouse schema.');
  return res.json();
}

export async function fetchTableSample(
  tableName: string,
  limit: number = 8
): Promise<WarehouseTableSample> {
  const res = await fetch(`${API_BASE_URL}/api/warehouse/table/${tableName}?limit=${limit}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Failed to retrieve sample rows from ${tableName}.`);
  return res.json();
}

export async function fetchHistoricalContext(params: {
  age?: number;
  job?: string;
  contact?: string;
  poutcome?: string;
}): Promise<HistoricalContext> {
  const q = new URLSearchParams();
  if (params.age !== undefined) q.set('age', String(params.age));
  if (params.job) q.set('job', params.job);
  if (params.contact) q.set('contact', params.contact);
  if (params.poutcome) q.set('poutcome', params.poutcome);

  const res = await fetch(`${API_BASE_URL}/api/warehouse/context?${q.toString()}`, {
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) throw new Error('Failed to retrieve historical context.');
  return res.json();
}
