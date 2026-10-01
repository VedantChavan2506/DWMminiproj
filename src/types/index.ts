export type UserRole = 'BANK_MANAGER' | 'ADMIN';

// Bank Manager business-facing pages
export type ManagerNavigationItem =
  | 'dashboard'
  | 'assessment'
  | 'explorer'
  | 'help';

// Admin technical/academic pages
export type AdminNavigationItem =
  | 'tech-overview'
  | 'python-impl'
  | 'dataset'
  | 'preprocessing'
  | 'smote-analysis'
  | 'model-comparison'
  | 'machine-learning'
  | 'etl-process'
  | 'data-warehouse'
  | 'star-schema'
  | 'olap-ops'
  | 'backend-api'
  | 'architecture'
  | 'project-map';

export type NavigationItem =
  | ManagerNavigationItem
  | AdminNavigationItem
  | 'technical';

// --- Shared data types (preserved from original) ---
export interface ModelMetric {
  model: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  auc?: number;
}

export interface ConfusionMatrixData {
  tn: number;
  fp: number;
  fn: number;
  tp: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  label: string;
  category: 'Call Details' | 'Economic' | 'Customer Profile' | 'Campaign History';
}

export interface RateItem {
  category: string;
  yes: number;
  no: number;
  total: number;
  rate: number;
}

export interface BoxPlotStats {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
  count: number;
}

export interface DatasetRow {
  age: string;
  job: string;
  marital: string;
  education: string;
  default: string;
  housing: string;
  loan: string;
  contact: string;
  month: string;
  day_of_week?: string;
  duration: string;
  campaign: string;
  pdays: string;
  previous: string;
  poutcome: string;
  'emp.var.rate'?: string;
  'cons.price.idx'?: string;
  'cons.conf.idx'?: string;
  euribor3m: string;
  'nr.employed'?: string;
  y: string;
  [key: string]: string | undefined;
}

// --- Historical Context from Data Warehouse ---
export interface HistoricalContext {
  matching_records: number;
  positive_responses: number;
  historical_response_rate: number;
  segment_description: string;
  disclaimer: string;
}

// --- Prediction / Assessment types ---
export interface PredictionRequest {
  age: number;
  job: string;
  contact: string;
  campaign: number;
  previous: number;
  poutcome: string;
  euribor3m: number;
  duration: number;
}

export interface PredictionResponse {
  prediction: 'yes' | 'no';
  probability: number;
  error?: string;
}

export type InterestLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface AssessmentResult {
  interestLevel: InterestLevel;
  estimatedLikelihood: number; // 0–100 (percentage)
  priority: Priority;
  recommendedAction: string;
  whyExplanation: string[];
  rawProbability: number;
  historicalContext?: HistoricalContext;
  error?: string;
}

// --- Data Warehouse & Dashboard Types ---
export interface WarehouseKpis {
  total_records: number;
  positive_responses: number;
  response_rate: number;
  total_contacts: number;
  avg_duration: number;
  highest_response_group: string;
  highest_response_rate: number;
}

export interface AgeDistributionItem {
  age_group: string;
  total: number;
  yes: number;
  no: number;
  response_rate: number;
}

export interface ContactDistributionItem {
  contact_method: string;
  total: number;
  yes: number;
  no: number;
  response_rate: number;
}

export interface JobDistributionItem {
  occupation: string;
  total: number;
  yes: number;
  no: number;
  response_rate: number;
}

export interface ContactFrequencyItem {
  contact_bucket: string;
  total: number;
  yes: number;
  no: number;
  response_rate: number;
}

export interface PoutcomeDistributionItem {
  previous_outcome: string;
  total: number;
  yes: number;
  no: number;
  response_rate: number;
}

export interface MonthlyPatternItem {
  month: string;
  total: number;
  yes: number;
  no: number;
  response_rate: number;
}

export interface CampaignStory {
  title: string;
  total_records: number;
  positive_responses: number;
  response_rate: number;
  active_focus: string;
  summary_text: string;
}

export interface DashboardFilters {
  ageGroup: string;
  occupation: string;
  contactMethod: string;
  month: string;
  previousResult: string;
  campaignRange: string;
}

export interface DashboardAnalyticsResponse {
  kpis: WarehouseKpis;
  age_distribution: AgeDistributionItem[];
  contact_distribution: ContactDistributionItem[];
  job_distribution: JobDistributionItem[];
  contact_frequency: ContactFrequencyItem[];
  poutcome_distribution: PoutcomeDistributionItem[];
  monthly_pattern: MonthlyPatternItem[];
  insights: string[];
  campaign_story: CampaignStory;
  applied_filters: Record<string, any>;
}

// --- Campaign Explorer / OLAP types ---
export type DrillDimension =
  | 'overall'
  | 'ageGroup'
  | 'occupation'
  | 'contactMethod'
  | 'previousResult';

export interface DrillLevel {
  dimension: DrillDimension;
  value: string | null;
  label: string;
}

export interface ExplorerFilters {
  ageGroup: string | null;
  occupation: string | null;
  contactMethod: string | null;
  previousResult: string | null;
}

export interface OlapRow {
  group_name: string;
  total: number;
  yes: number;
  no: number;
  response_rate: number;
}

export interface OlapOperationResponse {
  operation: 'ROLL-UP' | 'DRILL-DOWN' | 'SLICE' | 'DICE';
  manager_label: string;
  dimension?: string;
  parent_dimension?: string;
  parent_value?: string;
  drill_dimension?: string;
  data: OlapRow[] | DashboardAnalyticsResponse;
}

// --- Technical Details / Warehouse Schema ---
export interface ColumnDefinition {
  name: string;
  type: string;
  pk: boolean;
  notnull: boolean;
}

export interface ForeignKeyDefinition {
  id: number;
  from: string;
  table: string;
  to: string;
}

export interface TableInfo {
  row_count: number;
  columns: ColumnDefinition[];
  foreign_keys: ForeignKeyDefinition[];
}

export interface WarehouseSchemaResponse {
  database: string;
  schema_type: string;
  central_fact: string;
  dimension_tables: string[];
  tables: Record<string, TableInfo>;
}

export interface WarehouseTableSample {
  table: string;
  columns: string[];
  sample_rows: Record<string, any>[];
  total_records: number;
}
